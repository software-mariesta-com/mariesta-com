import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { createBusinessSchema } from '#lib/schemas/business';
import { createBusiness, listBusinesses } from '#lib/remotes/business.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'businesses', 'view');
	const items = await listBusinesses();
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'businesses', 'create');
	const body = await event.request.json();
	const parsed = createBusinessSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createBusiness(parsed.data);
	return json(item, { status: 201 });
};
