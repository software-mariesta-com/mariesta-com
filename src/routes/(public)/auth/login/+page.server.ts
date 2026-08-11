import { otpRedirectUrl, twoFactorRedirectUrl } from '#lib/constants/auth-routes';
import { auth, authConfig } from '#lib/server/auth';
import {
	finalizeAuthRedirect,
	readAuthReturn,
	rememberAuthReturn,
	safeRedirectTo
} from '#lib/server/sso/redirect';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

function isUnverifiedEmailError(error: unknown) {
	if (!(error instanceof APIError)) return false;
	const msg = error.message.toLowerCase();
	return msg.includes('verif') || msg.includes('email not verified');
}

export const load: PageServerLoad = async (event) => {
	const redirectTo = safeRedirectTo(event.url.searchParams.get('redirectTo'));
	rememberAuthReturn(event, redirectTo);

	if (event.locals.user) {
		const token = event.locals.session?.token;
		await finalizeAuthRedirect(event, redirectTo, token);
	}

	return {
		githubEnabled: authConfig.githubEnabled,
		redirectTo
	};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = readAuthReturn(event, formData.get('redirectTo')?.toString());
		rememberAuthReturn(event, redirectTo);

		try {
			const result = await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: redirectTo
				},
				headers: event.request.headers
			});

			if (
				result &&
				typeof result === 'object' &&
				'twoFactorRedirect' in result &&
				(result as { twoFactorRedirect?: boolean }).twoFactorRedirect
			) {
				redirect(303, twoFactorRedirectUrl(redirectTo));
			}

			const token =
				result && typeof result === 'object' && 'token' in result
					? String((result as { token: string }).token)
					: null;

			await finalizeAuthRedirect(event, redirectTo, token);
		} catch (error) {
			if (isRedirect(error)) throw error;

			const msg = error instanceof APIError ? error.message : '';
			if (msg.toLowerCase().includes('two factor') || msg.toLowerCase().includes('2fa')) {
				redirect(303, twoFactorRedirectUrl(redirectTo));
			}

			if (isUnverifiedEmailError(error) && email) {
				try {
					await auth.api.sendVerificationOTP({
						body: { email, type: 'email-verification' },
						headers: event.request.headers
					});
				} catch {
					// Still send the user to OTP entry even if resend fails.
				}
				redirect(303, otpRedirectUrl(email, 'email-verification', redirectTo));
			}

			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}
	},

	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'github';
		const callbackURL = readAuthReturn(event, formData.get('callbackURL')?.toString());
		rememberAuthReturn(event, callbackURL);

		try {
			const result = await auth.api.signInSocial({
				body: {
					provider: provider as 'github',
					callbackURL
				}
			});

			if (result.url) redirect(303, result.url);
			return fail(400, { message: 'Social sign-in failed' });
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Social sign-in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}
	}
};
