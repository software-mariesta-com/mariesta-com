import { AUTH_ROUTES, otpRedirectUrl } from '#lib/constants/auth-routes';
import { auth, authConfig } from '#lib/server/auth';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

function safeRedirectTo(value: string | null | undefined) {
	if (!value || !value.startsWith('/') || value.startsWith('//')) {
		return AUTH_ROUTES.dashboard;
	}
	return value;
}

function isUnverifiedEmailError(error: unknown) {
	if (!(error instanceof APIError)) return false;
	const msg = error.message.toLowerCase();
	return msg.includes('verif') || msg.includes('email not verified');
}

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		redirect(303, safeRedirectTo(event.url.searchParams.get('redirectTo')));
	}

	return {
		githubEnabled: authConfig.githubEnabled,
		redirectTo: safeRedirectTo(event.url.searchParams.get('redirectTo'))
	};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = safeRedirectTo(formData.get('redirectTo')?.toString());

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
				redirect(303, AUTH_ROUTES.twoFactor);
			}
		} catch (error) {
			if (isRedirect(error)) throw error;

			const msg = error instanceof APIError ? error.message : '';
			if (msg.toLowerCase().includes('two factor') || msg.toLowerCase().includes('2fa')) {
				redirect(303, AUTH_ROUTES.twoFactor);
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
				redirect(303, otpRedirectUrl(email, 'email-verification'));
			}

			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(303, redirectTo);
	},

	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'github';
		const callbackURL = safeRedirectTo(formData.get('callbackURL')?.toString());

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
