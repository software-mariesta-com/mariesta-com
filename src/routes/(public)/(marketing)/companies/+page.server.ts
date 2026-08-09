import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { businesses } = await parent();
	return { items: businesses, loadError: null };
};
