import { listPublishedCareers } from '#lib/remotes/career.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const items = await listPublishedCareers();
		return { items: JSON.parse(JSON.stringify(items)), loadError: null };
	} catch {
		return { items: [], loadError: 'Failed to load openings' };
	}
};
