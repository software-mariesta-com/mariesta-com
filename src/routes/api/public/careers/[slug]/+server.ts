import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPublishedCareerBySlug } from '#lib/remotes/career.remote';

export const GET: RequestHandler = async (event) => {
	const slug = event.params.slug?.trim();
	if (!slug) error(400, 'Missing slug');
	const item = await getPublishedCareerBySlug(slug);
	return json(item);
};
