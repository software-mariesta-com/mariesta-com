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

	return { redirectTo };
};

export const actions: Actions = {
	verifyTotp: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code')?.toString() ?? '';
		const redirectTo = readAuthReturn(event, formData.get('redirectTo')?.toString());

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

		await finalizeAuthRedirect(
			event,
			redirectTo,
			sessionTokenFromEvent(event) ?? event.locals.session?.token
		);
	},

	verifyBackup: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code')?.toString() ?? '';
		const redirectTo = readAuthReturn(event, formData.get('redirectTo')?.toString());

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

		await finalizeAuthRedirect(
			event,
			redirectTo,
			sessionTokenFromEvent(event) ?? event.locals.session?.token
		);
	}
};
