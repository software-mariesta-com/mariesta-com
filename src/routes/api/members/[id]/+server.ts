import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { updateMemberSchema } from '#lib/schemas/member';
import { deleteMember, getMember, updateMember } from '#lib/remotes/member.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'members', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getMember(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'members', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateMemberSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updateMember(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'members', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deleteMember({ id });
	return json({ ok: true });
};
