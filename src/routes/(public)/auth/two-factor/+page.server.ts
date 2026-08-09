import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { auth } from '#lib/server/auth';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		redirect(303, AUTH_ROUTES.dashboard);
	}
	return {};
};

export const actions: Actions = {
	verifyTotp: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code')?.toString() ?? '';

		try {
			await auth.api.verifyTOTP({
				body: { code },
				headers: event.request.headers
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Invalid code' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(303, AUTH_ROUTES.dashboard);
	},

	verifyBackup: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code')?.toString() ?? '';

		try {
			await auth.api.verifyBackupCode({
				body: { code },
				headers: event.request.headers
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Invalid backup code' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(303, AUTH_ROUTES.dashboard);
	}
};
