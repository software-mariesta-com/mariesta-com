import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { mintSsoCode } from './code';
import { getAppOrigin, getAuthCookieDomain, getTrustedOrigins } from './env';

const RETURN_COOKIE = 'mariesta_auth_return';

function isTrustedAbsoluteUrl(url: URL): boolean {
	const origin = url.origin;
	return getTrustedOrigins().some((trusted) => {
		try {
			return new URL(trusted).origin === origin;
		} catch {
			return trusted === origin;
		}
	});
}

/**
 * Allow relative app paths or absolute URLs whose origin is in the trusted list.
 */
export function safeRedirectTo(value: string | null | undefined): string {
	if (!value) return AUTH_ROUTES.dashboard;

	const trimmed = value.trim();
	if (!trimmed) return AUTH_ROUTES.dashboard;

	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
		return trimmed;
	}

	try {
		const url = new URL(trimmed);
		if ((url.protocol === 'http:' || url.protocol === 'https:') && isTrustedAbsoluteUrl(url)) {
			return url.toString();
		}
	} catch {
		// fall through
	}

	return AUTH_ROUTES.dashboard;
}

/** Persist return URL across OTP / 2FA steps (httpOnly). */
export function rememberAuthReturn(event: RequestEvent, redirectTo: string) {
	const safe = safeRedirectTo(redirectTo);
	event.cookies.set(RETURN_COOKIE, safe, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: getAppOrigin().startsWith('https'),
		maxAge: 60 * 15
	});
}

export function readAuthReturn(event: RequestEvent, fallback?: string | null): string {
	const fromCookie = event.cookies.get(RETURN_COOKIE);
	return safeRedirectTo(fallback ?? fromCookie);
}

export function clearAuthReturn(event: RequestEvent) {
	event.cookies.delete(RETURN_COOKIE, { path: '/' });
}

/**
 * Whether the browser can share the IdP session cookie with `targetOrigin`
 * via AUTH_COOKIE_DOMAIN (sibling subdomains). Never true for localhost.
 */
export function canShareSessionCookie(targetOrigin: string): boolean {
	const domain = getAuthCookieDomain();
	if (!domain) return false;

	let host: string;
	try {
		host = new URL(targetOrigin).hostname;
	} catch {
		return false;
	}

	if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
		return false;
	}

	const parent = domain.startsWith('.') ? domain.slice(1) : domain;
	return host === parent || host.endsWith(`.${parent}`);
}

function isExternalRedirect(redirectTo: string): boolean {
	return redirectTo.startsWith('http://') || redirectTo.startsWith('https://');
}

/**
 * Redirect to a location already validated by {@link safeRedirectTo}.
 * Absolute URLs must be in SSO trusted origins (SvelteKit 2 requires an allowlist).
 */
export function redirectToSafeLocation(location: string): never {
	if (isExternalRedirect(location)) {
		redirect(303, location, { external: getTrustedOrigins() });
	}
	redirect(303, location);
}

/**
 * After successful auth: same-origin path, shared-cookie absolute URL, or SSO code handoff.
 */
export async function finalizeAuthRedirect(
	event: RequestEvent,
	redirectTo: string,
	sessionToken: string | null | undefined
): Promise<never> {
	const target = safeRedirectTo(redirectTo);
	clearAuthReturn(event);

	if (!isExternalRedirect(target)) {
		redirect(303, target);
	}

	let targetUrl: URL;
	try {
		targetUrl = new URL(target);
	} catch {
		redirect(303, AUTH_ROUTES.dashboard);
	}

	if (canShareSessionCookie(targetUrl.origin)) {
		redirectToSafeLocation(targetUrl.toString());
	}

	if (!sessionToken) {
		redirect(303, AUTH_ROUTES.dashboard);
	}

	const code = await mintSsoCode(sessionToken);
	const nextPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` || '/';
	const callback = new URL('/auth/sso/callback', targetUrl.origin);
	callback.searchParams.set('code', code);
	callback.searchParams.set('next', nextPath);
	redirectToSafeLocation(callback.toString());
}

/** Build Mariesta login URL with absolute return (for docs / RP). */
export function mariestaLoginUrl(returnAbsoluteUrl: string): string {
	const base = getAppOrigin();
	return `${base}${AUTH_ROUTES.login}?redirectTo=${encodeURIComponent(returnAbsoluteUrl)}`;
}
