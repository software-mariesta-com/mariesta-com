import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { createPagePermissionSchema } from '#lib/schemas/page-permission';
import { createPagePermission, listPagePermissions } from '#lib/remotes/page-permission.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'page_permissions', 'view');
	const items = await listPagePermissions();
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'page_permissions', 'create');
	const body = await event.request.json();
	const parsed = createPagePermissionSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createPagePermission(parsed.data);
	return json(item, { status: 201 });
};
