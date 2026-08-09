import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPublishedPartners } from '#lib/remotes/partner.remote';

export const GET: RequestHandler = async () => {
	const items = await listPublishedPartners();
	return json(items);
};
