import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPublishedCareers } from '#lib/remotes/career.remote';

export const GET: RequestHandler = async () => {
	const items = await listPublishedCareers();
	return json(items);
};
