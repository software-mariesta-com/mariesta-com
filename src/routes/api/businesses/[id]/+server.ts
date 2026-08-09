import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { updateBusinessSchema } from '#lib/schemas/business';
import { deleteBusiness, getBusiness, updateBusiness } from '#lib/remotes/business.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'businesses', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getBusiness(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'businesses', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateBusinessSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updateBusiness(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'businesses', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deleteBusiness({ id });
	return json({ ok: true });
};
