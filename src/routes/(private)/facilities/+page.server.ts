import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.facilities.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const [facilitiesRes, businessesRes] = await Promise.all([
		fetch('/api/facilities'),
		fetch('/api/businesses')
	]);

	if (!facilitiesRes.ok) {
		return {
			items: [],
			businesses: [],
			loadError: 'Failed to load facilities',
			canCreate: capabilities.facilities.create,
			canUpdate: capabilities.facilities.update,
			canDelete: capabilities.facilities.delete
		};
	}

	return {
		items: await facilitiesRes.json(),
		businesses: businessesRes.ok ? await businessesRes.json() : [],
		loadError: null as string | null,
		canCreate: capabilities.facilities.create,
		canUpdate: capabilities.facilities.update,
		canDelete: capabilities.facilities.delete
	};
};
