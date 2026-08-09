import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { updateAuthUserSchema } from '#lib/schemas/auth-user';
import {
	deleteAuthUser,
	getAuthUser,
	resendAuthUserInvite,
	updateAuthUser
} from '#lib/remotes/auth-user.remote';
import { normalizeRole } from '#lib/server/permissions';
import { z } from 'zod';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'users', 'view');
	const id = z.string().min(1).parse(event.params.id);
	const item = await getAuthUser({ id });
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	requirePermission(actor, 'users', 'update');

	const id = z.string().min(1).parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateAuthUserSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}

	const actorRole = normalizeRole(actor.role);
	if (parsed.data.role === 'admin' && actorRole !== 'owner') {
		error(403, 'Only the owner can assign the admin role');
	}

	if (actor.id === id && parsed.data.role) {
		error(400, 'You cannot change your own role');
	}

	const item = await updateAuthUser(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	requirePermission(actor, 'users', 'delete');

	const id = z.string().min(1).parse(event.params.id);
	if (actor.id === id) {
		error(400, 'You cannot delete your own account');
	}

	await deleteAuthUser({ id });
	return json({ ok: true });
};

export const POST: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	requirePermission(actor, 'users', 'update');

	const id = z.string().min(1).parse(event.params.id);
	const body = await event.request.json().catch(() => ({}));
	const action = (body as { action?: string }).action;

	if (action === 'resend-invite') {
		await resendAuthUserInvite({ id });
		return json({ ok: true });
	}

	error(400, 'Unknown action');
};
