import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/public/careers/${encodeURIComponent(params.slug)}`);
	if (res.status === 404) error(404, 'Job not found');
	if (!res.ok) error(500, 'Failed to load job');
	return { job: await res.json() };
};
