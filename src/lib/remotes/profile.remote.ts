import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { isFreeUserTier } from '#lib/constants/user-tiers';
import {
	clearProfileAvatarSchema,
	updateDeveloperModeSchema,
	updateProfileAvatarSchema
} from '#lib/schemas/profile';
import { db } from '#lib/server/db';
import { user } from '#lib/server/db/schema';
import { deleteObject, mediaKeyFromStored, toMediaUrl } from '#lib/server/storage/tigris';

const profileColumns = {
	id: true,
	name: true,
	email: true,
	image: true,
	twoFactorEnabled: true,
	developerMode: true
} as const;

export const getProfile = query(z.object({ userId: z.string().min(1) }), async ({ userId }) => {
	const row = await db.query.user.findFirst({
		where: eq(user.id, userId),
		columns: profileColumns
	});
	if (!row) error(404, 'User not found');
	return { ...row, imageUrl: toMediaUrl(row.image) };
});

export const updateProfileAvatar = command(updateProfileAvatarSchema, async ({ userId, imageUrl }) => {
	const existing = await db.query.user.findFirst({
		where: eq(user.id, userId),
		columns: { image: true }
	});
	if (!existing) error(404, 'User not found');

	const previousKey = mediaKeyFromStored(existing.image);
	const nextKey = mediaKeyFromStored(imageUrl);

	const [row] = await db
		.update(user)
		.set({ image: imageUrl, updatedAt: new Date() })
		.where(eq(user.id, userId))
		.returning({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			twoFactorEnabled: user.twoFactorEnabled
		});

	if (!row) error(404, 'User not found');

	if (previousKey?.startsWith('avatars/') && previousKey !== nextKey) {
		try {
			await deleteObject(previousKey);
		} catch (err) {
			console.error('Failed to delete previous avatar', err);
		}
	}

	return { ...row, imageUrl: toMediaUrl(row.image) };
});

export const clearProfileAvatar = command(clearProfileAvatarSchema, async ({ userId }) => {
	const existing = await db.query.user.findFirst({
		where: eq(user.id, userId),
		columns: { image: true }
	});
	if (!existing) error(404, 'User not found');

	const key = mediaKeyFromStored(existing.image);
	await db
		.update(user)
		.set({ image: null, updatedAt: new Date() })
		.where(eq(user.id, userId));

	if (key?.startsWith('avatars/')) {
		try {
			await deleteObject(key);
		} catch (err) {
			console.error('Failed to delete avatar object', err);
		}
	}

	return { ok: true as const };
});

export const updateDeveloperMode = command(
	updateDeveloperModeSchema,
	async ({ userId, developerMode }) => {
		const existing = await db.query.user.findFirst({
			where: eq(user.id, userId),
			columns: { twoFactorEnabled: true, tier: true }
		});
		if (!existing) error(404, 'User not found');

		if (
			developerMode &&
			(!existing.twoFactorEnabled || isFreeUserTier(existing.tier))
		) {
			error(403, 'Developer mode requires two-factor authentication and a paid tier');
		}

		const [row] = await db
			.update(user)
			.set({ developerMode, updatedAt: new Date() })
			.where(eq(user.id, userId))
			.returning({ developerMode: user.developerMode });

		if (!row) error(404, 'User not found');
		return row;
	}
);
