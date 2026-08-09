import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { updateFacilitySchema } from '#lib/schemas/facility';
import { deleteFacility, getFacility, updateFacility } from '#lib/remotes/facility.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'facilities', 'view');
	const id = uuidSchema.parse(event.params.id);
	const item = await getFacility(id);
	return json(item);
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'facilities', 'update');
	const id = uuidSchema.parse(event.params.id);
	const body = await event.request.json();
	const parsed = updateFacilitySchema.safeParse({ ...body, id });
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await updateFacility(parsed.data);
	return json(item);
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'facilities', 'delete');
	const id = uuidSchema.parse(event.params.id);
	await deleteFacility({ id });
	return json({ ok: true });
};
