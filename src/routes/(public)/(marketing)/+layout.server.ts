import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/public/businesses');
	const businesses = res.ok ? await res.json() : [];
	return { businesses };
};
