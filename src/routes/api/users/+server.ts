import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { inviteUserSchema } from '#lib/schemas/auth-user';
import { inviteAuthUser, listAuthUsers } from '#lib/remotes/auth-user.remote';
import { normalizeRole } from '#lib/server/permissions';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'users', 'view');
	const items = await listAuthUsers();
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	requirePermission(actor, 'users', 'create');

	const body = await event.request.json();
	const parsed = inviteUserSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}

	const actorRole = normalizeRole(actor.role);
	if (parsed.data.role === 'admin' && actorRole !== 'owner') {
		error(403, 'Only the owner can invite admins');
	}

	const item = await inviteAuthUser(parsed.data);
	return json(item, { status: 201 });
};
