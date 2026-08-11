import {
	AUTH_COOKIE_DOMAIN,
	BETTER_AUTH_SECRET,
	ORIGIN,
	SSO_HMAC_SECRET,
	SSO_TRUSTED_ORIGINS,
	TRUSTED_ORIGINS
} from '$app/env/private';

/** Comma-separated origins from env (trimmed, empty entries dropped). */
export function parseOriginList(raw: string | undefined): string[] {
	if (!raw?.trim()) return [];
	return raw
		.split(',')
		.map((s) => s.trim().replace(/\/$/, ''))
		.filter(Boolean);
}

/**
 * Trusted website origins for Better Auth CORS/CSRF and SSO redirect allowlist.
 * Prefer `SSO_TRUSTED_ORIGINS`, fall back to `TRUSTED_ORIGINS`. Always includes this app's ORIGIN.
 */
export function getTrustedOrigins(): string[] {
	const fromEnv = parseOriginList(SSO_TRUSTED_ORIGINS ?? TRUSTED_ORIGINS);
	const self = ORIGIN.replace(/\/$/, '');
	const set = new Set<string>([self, ...fromEnv]);
	return [...set];
}

/** Optional cookie Domain for sibling SSO (e.g. `.mariesta.com`). Empty on localhost. */
export function getAuthCookieDomain(): string | undefined {
	const domain = AUTH_COOKIE_DOMAIN?.trim();
	return domain || undefined;
}

/** HMAC secret for one-time SSO codes. Rotates via env; falls back to BETTER_AUTH_SECRET. */
export function getSsoHmacSecret(): string {
	const explicit = SSO_HMAC_SECRET?.trim();
	if (explicit) return explicit;
	return `sso:${BETTER_AUTH_SECRET}`;
}

export function getAppOrigin(): string {
	return ORIGIN.replace(/\/$/, '');
}
