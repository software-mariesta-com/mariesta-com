import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { updatePartnerSchema } from '#lib/schemas/partner';
import { deletePartner, getPartner, updatePartner } from '#lib/remotes/partner.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'partners', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getPartner(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'partners', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updatePartnerSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updatePartner(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'partners', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deletePartner({ id });
	return json({ ok: true });
};
