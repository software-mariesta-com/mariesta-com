import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '#lib/server/auth';

export const POST: RequestHandler = async (event) => {
	await auth.api.signOut({
		headers: event.request.headers
	});
	redirect(303, AUTH_ROUTES.login);
};
