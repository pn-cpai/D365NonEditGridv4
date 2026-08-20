import { extractErrorMessage, LeahIntegrationConfig } from '../models/LeahConfiguration';
import { ApiError, AuthTokenRequest, AuthTokenResponse } from '../models/LeahApi';
import {
    CONFIG_ENTITY,
    isHarnessModeActive,
    retrieveLeahConfiguration,
    TOKEN_FIELD,
    updateCachedAccessToken
} from './LeahConfigService';

const TOKEN_EXPIRY_SKEW_MS = 60_000;
const GUID_REGEX =
    /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/;

let cachedAccessToken: string | null = null;

export function clearAuthCache(): void {
    cachedAccessToken = null;
}

/**
 * Returns a Bearer token.
 * Reuses an in-memory or table token while the JWT `exp` claim is still valid.
 * Otherwise calls Auth API and, in D365, stores the token on Leah Configuration.
 */
export async function getAccessToken(
    webAPI: ComponentFramework.WebApi,
    options?: { forceRefresh?: boolean }
): Promise<string> {
    const forceRefresh = options?.forceRefresh === true;
    const config = await retrieveLeahConfiguration(webAPI);

    if (!forceRefresh) {
        if (cachedAccessToken && isAccessTokenUsable(cachedAccessToken)) {
            return cachedAccessToken;
        }
        if (config.accessToken && isAccessTokenUsable(config.accessToken)) {
            cachedAccessToken = config.accessToken;
            return config.accessToken;
        }
    }

    const tokenResponse = await fetchAuthToken(config);
    cachedAccessToken = tokenResponse.access_token;
    updateCachedAccessToken(cachedAccessToken);

    if (!isHarnessModeActive()) {
        await persistAccessToken(webAPI, config.configurationId, cachedAccessToken);
    }

    return cachedAccessToken;
}

/** POST {{authApi}}/token */
async function fetchAuthToken(config: LeahIntegrationConfig): Promise<AuthTokenResponse> {
    if (!config.clientId || !config.clientSecret || !config.tenantName || !config.grantType) {
        throw new ApiError(
            'auth',
            'Leah Configuration is missing grant type, client id, client secret, or tenant name.'
        );
    }

    const payload: AuthTokenRequest = {
        grant_type: config.grantType,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        domain: config.tenantName
    };

    const tokenUrl = `${config.authApi}/token`;

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const bodyText = await safeReadText(response);
            throw new ApiError(
                'auth',
                `Token request failed (${response.status}): ${bodyText || response.statusText}`,
                response.status
            );
        }

        const data = (await response.json()) as AuthTokenResponse;
        if (!data?.access_token) {
            throw new ApiError('auth', 'Token response did not include access_token.');
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            'auth',
            extractErrorMessage(error, 'Unable to acquire access token.')
        );
    }
}

async function persistAccessToken(
    webAPI: ComponentFramework.WebApi,
    configurationId: string,
    accessToken: string
): Promise<void> {
    if (!configurationId || !GUID_REGEX.test(configurationId)) {
        return;
    }

    const recordId = configurationId.replace(/[{}]/g, '');

    try {
        await webAPI.updateRecord(CONFIG_ENTITY, recordId, {
            [TOKEN_FIELD]: accessToken
        });
    } catch (error) {
        console.warn(
            'Could not save access token to Leah Configuration. The token is still valid for this session.',
            extractErrorMessage(error)
        );
    }
}

function isAccessTokenUsable(token: string): boolean {
    if (!token.trim()) {
        return false;
    }

    const jwtExp = getJwtExpiryUtc(token);
    if (jwtExp === null) {
        return true;
    }

    return jwtExp > Date.now() + TOKEN_EXPIRY_SKEW_MS;
}

function getJwtExpiryUtc(token: string): number | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) {
            return null;
        }

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const json = atob(padded);
        const payload = JSON.parse(json) as { exp?: unknown };
        if (typeof payload.exp === 'number' && Number.isFinite(payload.exp)) {
            return payload.exp * 1000;
        }
        return null;
    } catch {
        return null;
    }
}

async function safeReadText(response: Response): Promise<string> {
    try {
        return await response.text();
    } catch {
        return '';
    }
}
