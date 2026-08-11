import { auth } from '#lib/server/auth';
import {
	finalizeAuthRedirect,
	readAuthReturn,
	rememberAuthReturn,
	safeRedirectTo
} from '#lib/server/sso/redirect';
import { sessionTokenFromEvent } from '#lib/server/sso/session-token';
import { fail, isRedirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const redirectTo = safeRedirectTo(
		event.url.searchParams.get('redirectTo') ?? event.cookies.get('mariesta_auth_return')
	);
	rememberAuthReturn(event, redirectTo);

	if (event.locals.user) {
		await finalizeAuthRedirect(event, redirectTo, event.locals.session?.token);
	}

	const email = event.url.searchParams.get('email')?.trim() ?? '';
	return { email, redirectTo };
};

export const actions: Actions = {
	verify: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const otp = formData.get('otp')?.toString().trim() ?? '';
		const redirectTo = readAuthReturn(event, formData.get('redirectTo')?.toString());

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

		await finalizeAuthRedirect(
			event,
			redirectTo,
			sessionTokenFromEvent(event) ?? event.locals.session?.token
		);
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
