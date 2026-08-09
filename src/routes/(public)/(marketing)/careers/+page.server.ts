import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/public/careers');
	if (!res.ok) {
		return { items: [], loadError: 'Failed to load openings' };
	}
	return { items: await res.json(), loadError: null };
};
