import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.members.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const [membersRes, departmentsRes] = await Promise.all([
		fetch('/api/members'),
		fetch('/api/departments')
	]);

	if (!membersRes.ok) {
		return {
			items: [],
			departments: [],
			loadError: 'Failed to load members',
			canCreate: capabilities.members.create,
			canUpdate: capabilities.members.update,
			canDelete: capabilities.members.delete
		};
	}

	return {
		items: await membersRes.json(),
		departments: departmentsRes.ok ? await departmentsRes.json() : [],
		loadError: null as string | null,
		canCreate: capabilities.members.create,
		canUpdate: capabilities.members.update,
		canDelete: capabilities.members.delete
	};
};
