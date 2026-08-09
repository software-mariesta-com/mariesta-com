import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.careers.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const [careersRes, businessesRes] = await Promise.all([
		fetch('/api/careers'),
		fetch('/api/businesses')
	]);

	if (!careersRes.ok) {
		return {
			items: [],
			businesses: [],
			loadError: 'Failed to load careers',
			canCreate: capabilities.careers.create,
			canUpdate: capabilities.careers.update,
			canDelete: capabilities.careers.delete
		};
	}

	return {
		items: await careersRes.json(),
		businesses: businessesRes.ok ? await businessesRes.json() : [],
		loadError: null as string | null,
		canCreate: capabilities.careers.create,
		canUpdate: capabilities.careers.update,
		canDelete: capabilities.careers.delete
	};
};
