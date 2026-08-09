import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [businessesRes, partnersRes, membersRes] = await Promise.all([
		fetch('/api/public/businesses'),
		fetch('/api/public/partners'),
		fetch('/api/public/members')
	]);

	const businesses = businessesRes.ok ? await businessesRes.json() : [];
	const partners = partnersRes.ok ? await partnersRes.json() : [];
	const members = membersRes.ok ? await membersRes.json() : [];

	return { businesses, partners, members };
};
