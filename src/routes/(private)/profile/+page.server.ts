import { auth } from '#lib/server/auth';
import { fail, isRedirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user!;
	return {
		user,
		twoFactorEnabled: Boolean(
			(user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled
		)
	};
};

export const actions: Actions = {
	enable2fa: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password')?.toString() ?? '';

		if (!password) {
			return fail(400, { message: 'Password is required' });
		}

		try {
			const result = await auth.api.enableTwoFactor({
				body: { password },
				headers: event.request.headers
			});

			return {
				totpURI: result.totpURI,
				backupCodes: result.backupCodes,
				success: 'Scan the QR code, then verify with a code from your app.'
			};
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Could not enable 2FA' });
			}
			return fail(500, { message: 'Unexpected error' });
		}
	},

	verify2fa: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code')?.toString().trim() ?? '';

		if (!code) {
			return fail(400, { message: 'Authenticator code is required' });
		}

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

		return { success: 'Two-factor authentication is now enabled.' };
	},

	disable2fa: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password')?.toString() ?? '';

		if (!password) {
			return fail(400, { message: 'Password is required' });
		}

		try {
			await auth.api.disableTwoFactor({
				body: { password },
				headers: event.request.headers
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Could not disable 2FA' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return { success: 'Two-factor authentication has been turned off.' };
	}
};
