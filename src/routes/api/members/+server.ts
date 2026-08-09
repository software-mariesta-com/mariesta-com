import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireApiUser, requirePermission } from '#lib/server/api-auth';
import { uuidSchema } from '#lib/schemas/common';
import { createMemberSchema } from '#lib/schemas/member';
import { createMember, listMembers } from '#lib/remotes/member.remote';

export const GET: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'members', 'view');
	const departmentIdParam = event.url.searchParams.get('departmentId');
	const departmentId = departmentIdParam ? uuidSchema.parse(departmentIdParam) : undefined;
	const items = await listMembers({ departmentId });
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const user = await requireApiUser(event);
	requirePermission(user, 'members', 'create');
	const body = await event.request.json();
	const parsed = createMemberSchema.safeParse(body);
	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid body');
	}
	const item = await createMember(parsed.data);
	return json(item, { status: 201 });
};
