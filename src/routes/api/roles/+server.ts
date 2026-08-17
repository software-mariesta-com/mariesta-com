import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { createRoleSchema } from '#lib/schemas/role';
import { createRole, listRoles } from '#lib/remotes/role.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'roles', 'view');
	const items = await listRoles();
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'roles', 'create');
	const body = await event.request.json();
	const parsed = createRoleSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createRole(parsed.data);
	return json(item, { status: 201 });
};
