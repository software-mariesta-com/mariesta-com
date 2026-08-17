import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { updateRoleSchema } from '#lib/schemas/role';
import { uuidSchema } from '#lib/schemas/common';
import { deleteRole, getRole, updateRole } from '#lib/remotes/role.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'roles', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getRole(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'roles', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateRoleSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updateRole(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'roles', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deleteRole({ id });
	return json({ ok: true });
};
