import {
    extractErrorMessage,
    HARNESS_LEAH_CONFIG,
    isHarnessWebApiUnsupportedError,
    isPcfTestHarness,
    LeahConfigurationRecord,
    LeahIntegrationConfig
} from '../models/LeahConfiguration';
import { ApiError } from '../models/LeahApi';

export const CONFIG_ENTITY = 'cr964_pnleahconfiguration';
export const TOKEN_FIELD = 'cr964_accesstoken';

const CUSTOM_NUMERIC_ID_FIELD = 'cr964_leahconfigurationid';
const GUID_REGEX =
    /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/;

let cachedConfig: LeahIntegrationConfig | null = null;
let harnessModeActive = false;

export function isHarnessModeActive(): boolean {
    return true; //harnessModeActive || isPcfTestHarness();
}

export function clearConfigCache(): void {
    cachedConfig = null;
    harnessModeActive = false;
}

export function mapConfigurationRecord(
    record: LeahConfigurationRecord,
    configurationId: string
): LeahIntegrationConfig {
    const baseUrl = (record.cr964_baseurl ?? '').trim().replace(/\/+$/, '');
    const authApi = (record.cr964_authapi ?? '').trim().replace(/\/+$/, '');

    if (!baseUrl || !authApi) {
        throw new ApiError(
            'config',
            'Leah Configuration is missing required Base URL or Auth API values.'
        );
    }

    return {
        configurationId,
        baseUrl,
        authApi,
        tenantName: (record.cr964_tenantname ?? '').trim(),
        grantType: (record.cr964_granttype ?? '').trim(),
        clientId: (record.cr964_clientid ?? '').trim(),
        clientSecret: (record.cr964_clientsecret ?? '').trim(),
        accessToken: record.cr964_accesstoken ?? null
    };
}

/**
 * Resolves the Dataverse primary key GUID from a retrieved row.
 * Do not use custom field cr964_leahconfigurationid (text/number like "101").
 */
export function resolveConfigurationPrimaryId(entity: Record<string, unknown>): string {
    const preferredKeys = ['cr964_pnleahconfigurationid', 'cr964_PNLeahConfigurationId'];

    for (const key of preferredKeys) {
        const value = entity[key];
        if (typeof value === 'string' && GUID_REGEX.test(value)) {
            return value.replace(/[{}]/g, '');
        }
    }

    for (const [key, value] of Object.entries(entity)) {
        const lower = key.toLowerCase();
        if (lower === CUSTOM_NUMERIC_ID_FIELD || !lower.endsWith('id')) {
            continue;
        }
        if (typeof value === 'string' && GUID_REGEX.test(value)) {
            return value.replace(/[{}]/g, '');
        }
    }

    const keys = Object.keys(entity).join(', ');
    throw new ApiError(
        'config',
        `Could not resolve primary GUID for ${CONFIG_ENTITY}. Returned keys: [${keys}]`
    );
}

/**
 * Test harness: hardcoded staging config.
 * D365: first row from PN Leah Configuration.
 */
export async function retrieveLeahConfiguration(
    webAPI: ComponentFramework.WebApi
): Promise<LeahIntegrationConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }

    if (isPcfTestHarness()) {
        return useHarnessConfig();
    }

    try {
        const result = await webAPI.retrieveMultipleRecords(
            CONFIG_ENTITY,
            `?$select=cr964_name,cr964_baseurl,cr964_authapi,cr964_tenantname,cr964_granttype,cr964_clientid,cr964_clientsecret,${TOKEN_FIELD}&$top=1`
        );

        if (!result.entities || result.entities.length === 0) {
            throw new ApiError(
                'config',
                `No Leah Configuration record found. Create a record in ${CONFIG_ENTITY}.`
            );
        }

        const raw = result.entities[0] as unknown as Record<string, unknown>;
        const configurationId = resolveConfigurationPrimaryId(raw);
        cachedConfig = mapConfigurationRecord(raw as unknown as LeahConfigurationRecord, configurationId);
        return cachedConfig;
    } catch (error) {
        if (isPcfTestHarness() || isHarnessWebApiUnsupportedError(error)) {
            return useHarnessConfig();
        }
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            'config',
            extractErrorMessage(error, 'Failed to retrieve Leah Configuration.')
        );
    }
}

export function updateCachedAccessToken(accessToken: string): void {
    if (!cachedConfig) {
        return;
    }
    cachedConfig = { ...cachedConfig, accessToken };
}

function useHarnessConfig(): LeahIntegrationConfig {
    harnessModeActive = true;
    cachedConfig = { ...HARNESS_LEAH_CONFIG };
    return cachedConfig;
}
