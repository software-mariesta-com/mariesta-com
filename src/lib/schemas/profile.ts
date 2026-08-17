import { z } from 'zod';

/** Profile avatar stored as an app-proxied media URL under `avatars/`. */
export const profileAvatarUrlSchema = z
	.string()
	.trim()
	.min(1)
	.refine((v) => v.startsWith('/api/media/avatars/'), {
		message: 'Invalid avatar URL'
	});

export const updateProfileAvatarSchema = z.object({
	userId: z.string().min(1),
	imageUrl: profileAvatarUrlSchema
});

export const clearProfileAvatarSchema = z.object({
	userId: z.string().min(1)
});

export const updateDeveloperModeSchema = z.object({
	userId: z.string().min(1),
	developerMode: z.boolean()
});
