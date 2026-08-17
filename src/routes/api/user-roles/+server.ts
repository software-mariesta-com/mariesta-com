import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { listAssignableRoles } from '#lib/remotes/auth-user.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'users', 'view');
	const items = await listAssignableRoles();
	return json(items);
};
