import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { auth } from '#lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		redirect(303, AUTH_ROUTES.dashboard);
	}
	return {};
};

export const actions: Actions = {
	requestReset: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		if (!email.trim()) {
			return fail(400, { message: 'Email is required' });
		}

		try {
			await auth.api.requestPasswordResetEmailOTP({
				body: { email },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Request failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(
			303,
			`${AUTH_ROUTES.resetPassword}?email=${encodeURIComponent(email)}`
		);
	}
};
