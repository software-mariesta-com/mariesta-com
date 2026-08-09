import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { getTextDirection } from '#lib/paraglide/runtime';
import { paraglideMiddleware } from '#lib/paraglide/server';

const PRIVATE_PATH_PREFIXES = [
	'/dashboard',
	'/profile',
	'/settings',
	'/users',
	'/members',
	'/partners',
	'/job-posts',
	'/departments',
	'/facilities',
	'/businesses'
] as const;

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Skip getSession on anonymous marketing HTML to cut TTFB. */
function shouldLoadSession(event: RequestEvent): boolean {
	const { pathname } = event.url;

	if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) return true;

	if (PRIVATE_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) return true;

	if (pathname.startsWith('/api/')) {
		if (pathname.startsWith('/api/public/') || pathname.startsWith('/api/media/')) return false;
		return true;
	}

	return event.cookies
		.getAll()
		.some((cookie) => /session[_-]?token/i.test(cookie.name));
}

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (shouldLoadSession(event)) {
		const session = await auth.api.getSession({ headers: event.request.headers });

		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth);
