import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/public/businesses');
	if (!res.ok) {
		return { items: [], loadError: 'Failed to load businesses' };
	}
	return { items: await res.json(), loadError: null };
};
