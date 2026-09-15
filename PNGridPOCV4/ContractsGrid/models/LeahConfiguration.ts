/**
 * Dataverse entity: cr964_pnleahconfiguration (display name: PN Leah Configuration)
 */
export interface LeahConfigurationRecord {
    /** Primary key GUID (logical name is lowercase; resolved at runtime from the row). */
    cr964_pnleahconfigurationid?: string;
    cr964_name?: string | null;
    cr964_baseurl: string;
    cr964_authapi: string;
    cr964_tenantname: string;
    cr964_granttype: string;
    cr964_clientid: string;
    cr964_clientsecret: string;
    cr964_accesstoken?: string | null;
}

/** Normalized config used by Auth and Contract API calls. */
export interface LeahIntegrationConfig {
    configurationId: string;
    baseUrl: string;
    authApi: string;
    tenantName: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    accessToken?: string | null;
}

/**
 * Hardcoded staging Leah credentials for the PCF test harness (`npm run start`).
 * Dataverse WebAPI / Leah Configuration table is unavailable in the harness, so
 * Auth + Contract API calls use these values instead.
 *
 * Production / D365 runtime still reads from `cr964_pnleahconfiguration`.
 */
export const HARNESS_LEAH_CONFIG: LeahIntegrationConfig = {
    configurationId: 'harness-local-config',
    baseUrl: 'https://cloudstaging.contractpod.com/cpaimt_api',
    //baseUrl: 'https://cpai-productapi-stg.azurewebsites.net',
    authApi: 'https://cloudstaging.contractpod.com/cpaimt_auth/auth',
    tenantName: 'execo2',
    grantType: 'client_credentials',
    clientId: '329B2F97FE5541CEA3169B74D43B0999',
    clientSecret: '01583BD09C034260AE9D62D790971218',
    accessToken: null
};

/**
 * True when running under pcf-start ("PowerApps component framework Test Environment").
 */
export function isPcfTestHarness(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
    }

    if (document.title.includes('PowerApps component framework Test Environment')) {
        return true;
    }

    const host = window.location.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
}

/** Well-known pcf-start WebAPI stub errors. */
export function isHarnessWebApiUnsupportedError(error: unknown): boolean {
    const message = extractErrorMessage(error).toLowerCase();
    return (
        message.includes('not yet supported') ||
        message.includes('retrieve multiple records') ||
        message.includes('retrievemultiplerecords') ||
        message.includes('is not supported')
    );
}

export function extractErrorMessage(error: unknown, fallback = ''): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (typeof error === 'string' && error.trim()) {
        return error;
    }
    if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as { message?: unknown }).message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
            return maybeMessage;
        }
    }
    return fallback;
}
