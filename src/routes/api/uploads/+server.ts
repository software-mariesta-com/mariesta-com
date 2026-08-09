import { json, error } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import type { RequestHandler } from './$types';
import { require2FA, requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uploadObject } from '#lib/server/storage/tigris';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

const FOLDERS = new Set(['partners', 'members']);

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
	const user = await requireApiUser(event);
	require2FA(user);

	const form = await event.request.formData();
	const file = form.get('file');
	const folderRaw = form.get('folder');

	const folderHint = typeof folderRaw === 'string' ? folderRaw : '';
	if (folderHint === 'partners') {
		requirePermission(user, 'partners', 'create');
	} else if (folderHint === 'members') {
		requirePermission(user, 'members', 'create');
	} else {
		error(403, 'Forbidden');
	}

	if (!(file instanceof File)) {
		error(400, 'file is required');
	}
	if (!ALLOWED_TYPES.has(file.type)) {
		error(400, 'Unsupported image type');
	}
	if (file.size > MAX_BYTES) {
		error(400, 'File too large (max 5MB)');
	}

	const folder = typeof folderRaw === 'string' && FOLDERS.has(folderRaw) ? folderRaw : 'uploads';
	const key = `${folder}/${uuidv4()}.${extensionFor(file.type)}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	try {
		const result = await uploadObject(key, buffer, file.type);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Upload failed', err);
		error(500, 'Upload failed. Check Tigris credentials.');
	}
};
