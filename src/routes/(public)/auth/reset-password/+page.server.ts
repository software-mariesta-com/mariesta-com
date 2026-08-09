import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { auth } from '#lib/server/auth';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		redirect(303, AUTH_ROUTES.dashboard);
	}

	const token = event.url.searchParams.get('token');
	const error = event.url.searchParams.get('error');

	return {
		email: event.url.searchParams.get('email') ?? '',
		token: token && !error ? token : '',
		tokenError: error === 'INVALID_TOKEN' ? 'This reset link is invalid or expired.' : null
	};
};

export const actions: Actions = {
	resetWithToken: async (event) => {
		const formData = await event.request.formData();
		const token = formData.get('token')?.toString().trim() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const newPasswordConfirm = formData.get('newPasswordConfirm')?.toString() ?? '';

		if (!token) return fail(400, { message: 'Reset token is required', mode: 'token' as const });
		if (newPassword !== newPasswordConfirm) {
			return fail(400, { message: 'Passwords do not match', mode: 'token' as const, token });
		}
		if (newPassword.length < 8) {
			return fail(400, {
				message: 'Password must be at least 8 characters',
				mode: 'token' as const,
				token
			});
		}

		try {
			await auth.api.resetPassword({
				body: { newPassword, token },
				headers: event.request.headers
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Reset failed',
					mode: 'token' as const,
					token
				});
			}
			return fail(500, { message: 'Unexpected error', mode: 'token' as const, token });
		}

		redirect(303, `${AUTH_ROUTES.login}?reset=1`);
	},

	reset: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const otp = formData.get('otp')?.toString().trim() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const newPasswordConfirm = formData.get('newPasswordConfirm')?.toString() ?? '';

		if (!email) return fail(400, { message: 'Email is required', email, mode: 'otp' as const });
		if (!otp) return fail(400, { message: 'Code is required', email, mode: 'otp' as const });
		if (newPassword !== newPasswordConfirm) {
			return fail(400, { message: 'Passwords do not match', email, mode: 'otp' as const });
		}
		if (newPassword.length < 8) {
			return fail(400, {
				message: 'Password must be at least 8 characters',
				email,
				mode: 'otp' as const
			});
		}

		try {
			await auth.api.resetPasswordEmailOTP({
				body: { email, otp, password: newPassword },
				headers: event.request.headers
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Reset failed',
					email,
					mode: 'otp' as const
				});
			}
			return fail(500, { message: 'Unexpected error', email, mode: 'otp' as const });
		}

		redirect(303, `${AUTH_ROUTES.login}?reset=1`);
	},

	resend: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';

		if (!email) return fail(400, { message: 'Email is required', email, mode: 'otp' as const });

		try {
			await auth.api.requestPasswordResetEmailOTP({
				body: { email },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Could not resend code',
					email,
					mode: 'otp' as const
				});
			}
			return fail(500, { message: 'Unexpected error', email, mode: 'otp' as const });
		}

		return { success: 'A new code was sent to your email.', email, mode: 'otp' as const };
	}
};
