import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AUTH_ROUTES } from '#lib/constants/auth-routes';

export const load: PageServerLoad = async ({ parent }) => {
	const { capabilities } = await parent();
	if (!capabilities.dashboard.view) {
		redirect(303, AUTH_ROUTES.profile);
	}
	return {};
};
