import { json, error } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import type { RequestHandler } from './$types';
import { require2FA, requireApiUser } from '#lib/server/api-auth';
import { clearProfileAvatar, updateProfileAvatar } from '#lib/remotes/profile.remote';
import { deleteObject, uploadObject } from '#lib/server/storage/tigris';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

function extensionFor(type: string): string {
	switch (type) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/png':
			return 'png';
		case 'image/webp':
			return 'webp';
		case 'image/gif':
			return 'gif';
		default:
			return 'bin';
	}
}

export const POST: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	require2FA(actor);

	const form = await event.request.formData();
	const file = form.get('file');

	if (!(file instanceof File)) {
		error(400, 'file is required');
	}
	if (!ALLOWED_TYPES.has(file.type)) {
		error(400, 'Unsupported image type');
	}
	if (file.size > MAX_BYTES) {
		error(400, 'File too large (max 5MB)');
	}

	const key = `avatars/${actor.id}/${uuidv4()}.${extensionFor(file.type)}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	try {
		const uploaded = await uploadObject(key, buffer, file.type);
		try {
			const updated = await updateProfileAvatar({ userId: actor.id, imageUrl: uploaded.url });
			return json(updated, { status: 200 });
		} catch (updateErr) {
			try {
				await deleteObject(key);
			} catch (cleanupErr) {
				console.error('Failed to roll back new avatar after DB update error', cleanupErr);
			}
			throw updateErr;
		}
	} catch (err) {
		console.error('Avatar upload failed', err);
		error(500, 'Upload failed. Check Tigris credentials.');
	}
};

export const DELETE: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	require2FA(actor);

	await clearProfileAvatar({ userId: actor.id });
	return json({ ok: true });
};
