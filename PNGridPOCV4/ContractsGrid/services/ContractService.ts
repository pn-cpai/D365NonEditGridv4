import { Contract, ContractStatus } from '../models/Contract';
import { extractErrorMessage } from '../models/LeahConfiguration';
import {
    ApiError,
    ContractSearchItem,
    ContractSearchRequest,
    ContractSearchResponse
} from '../models/LeahApi';
import { getAccessToken } from './LeahAuthService';
import { retrieveLeahConfiguration } from './LeahConfigService';

/** Staging application used by the contract-request search API. */
const LEAH_APPLICATION_ID = 77;
const SEARCH_PAGE_SIZE = 10;

export class ContractService {
    /**
     * Load contracts from Leah (ContractPod) search API.
     * Config comes from Dataverse in D365, or hardcoded harness values in pcf-start.
     */
    public static async fetchContractsByEntity(
        webAPI: ComponentFramework.WebApi,
        entityId: string,
        entityTypeName: string
    ): Promise<Contract[]> {
        const config = await retrieveLeahConfiguration(webAPI);
        const url = `${config.baseUrl}/api/${encodeURIComponent(config.tenantName)}/v3/contract-request/search`;
        const body = buildSearchRequest(entityId, entityTypeName);

        const payload = await postSearch(webAPI, url, body, false);
        return mapContracts(payload);
    }
}

async function postSearch(
    webAPI: ComponentFramework.WebApi,
    url: string,
    body: ContractSearchRequest,
    hasRetried: boolean
): Promise<ContractSearchResponse> {
    const accessToken = await getAccessToken(webAPI, { forceRefresh: hasRetried });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(body)
        });

        if (response.status === 401 && !hasRetried) {
            return postSearch(webAPI, url, body, true);
        }

        if (!response.ok) {
            const bodyText = await safeReadText(response);
            throw new ApiError(
                'contracts',
                `Contract search failed (${response.status}): ${bodyText || response.statusText}`,
                response.status
            );
        }

        return (await response.json()) as ContractSearchResponse;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            'contracts',
            extractErrorMessage(error, 'Unable to retrieve contracts from Leah.')
        );
    }
}

function buildSearchRequest(_entityId: string, _entityTypeName: string): ContractSearchRequest {
    return {
        filter: {
            applicationId: LEAH_APPLICATION_ID,
            pageNumber: 1,
            pageSize: SEARCH_PAGE_SIZE,
            search: '',
            fieldGroup: {
                fields: [],
                fieldGroups: [],
                concatenation: 'and',
                boost: 0
            }
        },
        sort: [
            {
                fieldName: 'modifiedon',
                fieldType: 'Standard',
                direction: 'desc'
            }
        ]
    };
}

function mapContracts(payload: ContractSearchResponse): Contract[] {
    const data = Array.isArray(payload.data) ? payload.data : [];
    return data.map(mapContract);
}

function mapContract(item: ContractSearchItem): Contract {
    const primaryAssignee = item.assignees?.find((assignee) => assignee.isPrimary) ?? item.assignees?.[0];

    return {
        id: String(item.contractId),
        contractNumber: String(item.contractId),
        title: item.requestDescription?.trim() ?? item.applicationTypeName?.trim() ?? `Contract ${item.contractId}`,
        contractValue: parseContractValue(item.contractValue),
        currency: mapCurrency(item.currencyCode, item.contractValueWithCurrency),
        startDate: formatDisplayDate(item.effectiveDate ?? item.addedOn),
        endDate: formatDisplayDate(item.expirationDate),
        status: mapStatus(item.contractStatus),
        owner: primaryAssignee?.fullName?.trim() ?? item.requesterFullName?.trim() ?? ''
    };
}

function parseContractValue(value: string | null | undefined): number {
    if (!value) {
        return 0;
    }
    const parsed = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

function mapCurrency(currencyCode?: string | null, valueWithCurrency?: string | null): string {
    if (currencyCode === 'USD') {
        return '$';
    }
    if (currencyCode?.trim()) {
        return currencyCode.trim();
    }
    const prefix = valueWithCurrency?.trim().charAt(0);
    return prefix ?? '';
}

function mapStatus(status: string | null | undefined): ContractStatus {
    switch ((status ?? '').trim()) {
        case 'Active':
            return 'Active';
        case 'Pending':
            return 'Pending';
        case 'Expired':
            return 'Expired';
        case 'Terminated':
            return 'Terminated';
        default:
            return 'Pending';
    }
}

function formatDisplayDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString();
}

async function safeReadText(response: Response): Promise<string> {
    try {
        return await response.text();
    } catch {
        return '';
    }
}
