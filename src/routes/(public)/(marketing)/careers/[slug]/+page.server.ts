import { error } from '@sveltejs/kit';
import { getPublishedCareerBySlug } from '#lib/remotes/career.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const job = await getPublishedCareerBySlug(params.slug);
		// Serialize Dates for the page (matches previous JSON API shape)
		return { job: JSON.parse(JSON.stringify(job)) as typeof job };
	} catch {
		error(404, 'Job not found');
	}
};
