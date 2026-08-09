import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { createPartnerSchema } from '#lib/schemas/partner';
import { createPartner, listPartners } from '#lib/remotes/partner.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'partners', 'view');
	const items = await listPartners();
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'partners', 'create');
	const body = await event.request.json();
	const parsed = createPartnerSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createPartner(parsed.data);
	return json(item, { status: 201 });
};
