import { listPublishedMembers } from '#lib/remotes/member.remote';
import { listPublishedPartners } from '#lib/remotes/partner.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { businesses } = await parent();
	const [partners, members] = await Promise.all([
		listPublishedPartners(),
		listPublishedMembers()
	]);

	return {
		businesses,
		partners: JSON.parse(JSON.stringify(partners)),
		members: JSON.parse(JSON.stringify(members))
	};
};
