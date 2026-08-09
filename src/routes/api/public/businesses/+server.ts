import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPublishedBusinesses } from '#lib/remotes/business.remote';

export const GET: RequestHandler = async () => {
	const items = await listPublishedBusinesses();
	return json(items);
};
