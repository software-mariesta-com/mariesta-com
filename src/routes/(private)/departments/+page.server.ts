import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.departments.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const [departmentsRes, facilitiesRes] = await Promise.all([
		fetch('/api/departments'),
		fetch('/api/facilities')
	]);

	if (!departmentsRes.ok) {
		return {
			items: [],
			facilities: [],
			loadError: 'Failed to load departments',
			canCreate: capabilities.departments.create,
			canUpdate: capabilities.departments.update,
			canDelete: capabilities.departments.delete
		};
	}

	return {
		items: await departmentsRes.json(),
		facilities: facilitiesRes.ok ? await facilitiesRes.json() : [],
		loadError: null as string | null,
		canCreate: capabilities.departments.create,
		canUpdate: capabilities.departments.update,
		canDelete: capabilities.departments.delete
	};
};
