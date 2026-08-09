import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { auth } from '#lib/server/auth';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		redirect(303, AUTH_ROUTES.dashboard);
	}

	const email = event.url.searchParams.get('email')?.trim() ?? '';
	return { email };
};

export const actions: Actions = {
	verify: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const otp = formData.get('otp')?.toString().trim() ?? '';

		if (!email) return fail(400, { message: 'Email is required', email });
		if (!otp) return fail(400, { message: 'Code is required', email });

		try {
			await auth.api.verifyEmailOTP({
				body: { email, otp },
				headers: event.request.headers
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Invalid or expired code',
					email
				});
			}
			return fail(500, { message: 'Unexpected error', email });
		}

		redirect(303, AUTH_ROUTES.dashboard);
	},

	resend: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';

		if (!email) return fail(400, { message: 'Email is required', email });

		try {
			await auth.api.sendVerificationOTP({
				body: {
					email,
					type: 'email-verification'
				},
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Could not resend code',
					email
				});
			}
			return fail(500, { message: 'Unexpected error', email });
		}

		return {
			success: 'A new code was sent to your email.',
			email
		};
	}
};
