import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Public signup is disabled. Accounts are invite-only. */
export const load: PageServerLoad = () => {
	redirect(303, AUTH_ROUTES.login);
};
