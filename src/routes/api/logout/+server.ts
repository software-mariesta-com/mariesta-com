import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import type { RequestHandler } from './$types';
import { auth } from '#lib/server/auth';
import { redirectToSafeLocation, safeRedirectTo } from '#lib/server/sso/redirect';

async function resolveRedirectTo(event: Parameters<RequestHandler>[0]): Promise<string> {
	const fromQuery = event.url.searchParams.get('redirectTo');
	if (fromQuery) return safeRedirectTo(fromQuery);

	try {
		const formData = await event.request.formData();
		const fromForm = formData.get('redirectTo')?.toString();
		if (fromForm) return safeRedirectTo(fromForm);
	} catch {
		// GET or empty body
	}

	return AUTH_ROUTES.login;
}

export const POST: RequestHandler = async (event) => {
	await auth.api.signOut({
		headers: event.request.headers
	});
	redirectToSafeLocation(await resolveRedirectTo(event));
};

export const GET: RequestHandler = async (event) => {
	await auth.api.signOut({
		headers: event.request.headers
	});
	redirectToSafeLocation(await resolveRedirectTo(event));
};
