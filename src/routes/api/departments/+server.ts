import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { createDepartmentSchema } from '#lib/schemas/department';
import { createDepartment, listDepartments } from '#lib/remotes/department.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'departments', 'view');
	const facilityIdParam = event.url.searchParams.get('facilityId');
	const facilityId = facilityIdParam ? uuidSchema.parse(facilityIdParam) : undefined;
	const items = await listDepartments({ facilityId });
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'departments', 'create');
	const body = await event.request.json();
	const parsed = createDepartmentSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createDepartment(parsed.data);
	return json(item, { status: 201 });
};
