import { listPublishedMembers } from '#lib/remotes/member.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const members = await listPublishedMembers();
	return {
		items: JSON.parse(
			JSON.stringify(
				members.map((m) => ({
					id: m.id,
					name: m.name,
					role: m.role,
					photoUrl: m.photoUrl,
					linkUrl: m.linkUrl
				}))
			)
		) as {
			id: string;
			name: string;
			role: string;
			photoUrl: string | null;
			linkUrl: string | null;
		}[],
		loadError: null as string | null
	};
};
