import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { createFacilitySchema } from '#lib/schemas/facility';
import { createFacility, listFacilities } from '#lib/remotes/facility.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'facilities', 'view');
	const businessIdParam = event.url.searchParams.get('businessId');
	const businessId = businessIdParam ? uuidSchema.parse(businessIdParam) : undefined;
	const items = await listFacilities({ businessId });
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'facilities', 'create');
	const body = await event.request.json();
	const parsed = createFacilitySchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createFacility(parsed.data);
	return json(item, { status: 201 });
};
