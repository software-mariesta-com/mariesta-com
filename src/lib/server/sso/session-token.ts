import type { RequestEvent } from '@sveltejs/kit';

const SESSION_COOKIE = 'better-auth.session_token';
const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`;

/**
 * Read the unsigned session token from the Better Auth signed cookie on this request.
 * Prefer this after API calls that set cookies via the sveltekitCookies plugin.
 */
export function sessionTokenFromEvent(event: RequestEvent): string | null {
	const raw =
		event.cookies.get(SESSION_COOKIE) ?? event.cookies.get(SECURE_SESSION_COOKIE) ?? null;
	if (!raw) return null;

	const lastDot = raw.lastIndexOf('.');
	if (lastDot < 1) return raw;
	return raw.slice(0, lastDot);
}
