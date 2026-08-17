import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { updatePagePermissionSchema } from '#lib/schemas/page-permission';
import { uuidSchema } from '#lib/schemas/common';
import {
	deletePagePermission,
	getPagePermission,
	updatePagePermission
} from '#lib/remotes/page-permission.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'page_permissions', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getPagePermission(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'page_permissions', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updatePagePermissionSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updatePagePermission(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'page_permissions', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deletePagePermission({ id });
	return json({ ok: true });
};
