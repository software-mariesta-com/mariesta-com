import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { createCareerSchema } from '#lib/schemas/career';
import { createCareer, listCareers } from '#lib/remotes/career.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'careers', 'view');
	const items = await listCareers();
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'careers', 'create');
	const body = await event.request.json();
	const parsed = createCareerSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createCareer(parsed.data);
	return json(item, { status: 201 });
};
