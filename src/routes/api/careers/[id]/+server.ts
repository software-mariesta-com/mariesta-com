import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { updateCareerSchema } from '#lib/schemas/career';
import { deleteCareer, getCareer, updateCareer } from '#lib/remotes/career.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'careers', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getCareer(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'careers', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateCareerSchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updateCareer(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'careers', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deleteCareer({ id });
	return json({ ok: true });
};
