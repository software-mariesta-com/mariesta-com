import { ORIGIN, TIER_CHANGE_URL, BROWSE_PLANS_URL, SSO_TRUSTED_ORIGINS } from '$app/env/private';
import { eq } from 'drizzle-orm';
import { DEMO_PURCHASE_PLANS } from '#lib/constants/purchase-plans';
import { normalizeUserTier, userTierLabel, isFreeUserTier } from '#lib/constants/user-tiers';
import { auth } from '#lib/server/auth';
import { db } from '#lib/server/db';
import { user as userTable } from '#lib/server/db/schema';
import { toMediaUrl } from '#lib/server/storage/tigris';
import { fail, isRedirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

function defaultBrowsePlansUrl(): string {
	const explicit = BROWSE_PLANS_URL?.trim();
	if (explicit) return explicit;
	const firstOrigin = SSO_TRUSTED_ORIGINS?.split(',')[0]?.trim();
	if (firstOrigin) return firstOrigin;
	return `${ORIGIN}/home`;
}

export const load: PageServerLoad = async (event) => {
	const sessionUser = event.locals.user!;
	const row = await db.query.user.findFirst({
		where: eq(userTable.id, sessionUser.id),
		columns: { tier: true, developerMode: true, image: true }
	});
	const tier = normalizeUserTier(row?.tier);
	const tierChangeUrl = TIER_CHANGE_URL?.trim() || `${ORIGIN}/home`;
	const browsePlansUrl = defaultBrowsePlansUrl();
	const twoFactorEnabled = Boolean(
		(sessionUser as { twoFactorEnabled?: boolean | null }).twoFactorEnabled
	);
	const developerMode = Boolean(row?.developerMode);
	const isFreeTier = isFreeUserTier(row?.tier);
	const canEnableDeveloperMode = twoFactorEnabled && !isFreeTier;

	return {
		user: {
			...sessionUser,
			image: row?.image ?? sessionUser.image ?? null,
			imageUrl: toMediaUrl(row?.image ?? sessionUser.image)
		},
		tier,
		tierLabel: userTierLabel(tier),
		tierChangeUrl,
		browsePlansUrl,
		purchasePlans: DEMO_PURCHASE_PLANS,
		twoFactorEnabled,
		developerMode,
		isFreeTier,
		canEnableDeveloperMode
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
