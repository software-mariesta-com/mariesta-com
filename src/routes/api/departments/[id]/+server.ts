import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { updateDepartmentSchema } from '#lib/schemas/department';
import { deleteDepartment, getDepartment, updateDepartment } from '#lib/remotes/department.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'departments', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getDepartment(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'departments', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateDepartmentSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updateDepartment(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'departments', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deleteDepartment({ id });
	return json({ ok: true });
};
