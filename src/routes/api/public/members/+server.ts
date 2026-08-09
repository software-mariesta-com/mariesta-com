import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPublishedMembers } from '#lib/remotes/member.remote';

export const GET: RequestHandler = async () => {
	const items = await listPublishedMembers();
	return json(items);
};
