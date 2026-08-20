/** POST {{authApi}}/token request body */
export interface AuthTokenRequest {
    grant_type: string;
    client_id: string;
    client_secret: string;
    domain: string;
}

/** POST {{authApi}}/token response */
export interface AuthTokenResponse {
    access_token: string;
    created_at?: string;
    expires_in?: string;
    token_type?: string;
}

export interface ContractSearchField {
    fieldName: string;
    fieldType: string;
    operator: string;
    boost: number;
    textValues: string[];
}

/** POST {{baseUrl}}/api/{{tenantName}}/v3/contract-request/search */
export interface ContractSearchRequest {
    filter: {
        applicationId: number;
        pageNumber: number;
        pageSize: number;
        search: string;
        fieldGroup: {
            fields: ContractSearchField[];
            fieldGroups: unknown[];
            concatenation: 'and' | 'or';
            boost: number;
        };
    };
    sort: {
        fieldName: string;
        fieldType: string;
        direction: 'asc' | 'desc';
    }[];
}

export interface ContractSearchAssignee {
    username?: string | null;
    fullName?: string | null;
    isPrimary?: boolean;
}

export interface ContractSearchItem {
    requestId: number;
    contractId: number;
    requestDescription?: string | null;
    applicationTypeName?: string | null;
    contractStatus?: string | null;
    contractValue?: string | null;
    contractValueWithCurrency?: string | null;
    currencyCode?: string | null;
    effectiveDate?: string | null;
    expirationDate?: string | null;
    addedOn?: string | null;
    assignees?: ContractSearchAssignee[] | null;
    requesterFullName?: string | null;
}

export interface ContractSearchResponse {
    totalRecords?: number;
    data?: ContractSearchItem[];
    statusCode?: number;
    message?: string | null;
}

/** Nested requester user on a contract request */
export interface RequesterUser {
  userId: number;
  departmentId: number;
}

/** Single item in Contract Request API data[] */
export interface ContractRequestItem {
  id: number;
  recordId: number;
  workflowStage: string;
  requesterUser: RequesterUser;
}

/** GET {{baseUrl}}/api/{{tenant_name}}/contract-request response */
export interface ContractRequestResponse {
  data: ContractRequestItem[];
  statusCode: number;
  message: string;
  totalRecords: number;
}

export type ApiErrorSource = 'config' | 'auth' | 'contracts';

export class ApiError extends Error {
    public readonly source: ApiErrorSource;
    public readonly status?: number;

    public constructor(source: ApiErrorSource, message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.source = source;
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
