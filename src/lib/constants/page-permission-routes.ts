import { ADMIN_ROUTES } from '#lib/constants/admin-routes';
import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import {
	PERMISSION_ACTIONS,
	PERMISSION_SECTION_LABELS,
	PERMISSION_SECTIONS,
	type PermissionAction,
	type PermissionSection
} from '#lib/constants/permissions';

export const SECTION_ROUTE_PATTERNS: Record<PermissionSection, string> = {
	dashboard: ADMIN_ROUTES.dashboard,
	businesses: ADMIN_ROUTES.businesses,
	facilities: ADMIN_ROUTES.facilities,
	departments: ADMIN_ROUTES.departments,
	members: ADMIN_ROUTES.members,
	partners: ADMIN_ROUTES.partners,
	careers: ADMIN_ROUTES.careers,
	page_permissions: ADMIN_ROUTES.pagePermissions,
	roles: ADMIN_ROUTES.roles,
	users: ADMIN_ROUTES.users,
	profile: AUTH_ROUTES.profile
};

export type PagePermissionSeed = {
	slug: string;
	name: string;
	routePattern: string;
	section: PermissionSection;
	action: PermissionAction;
	description: string;
	sortOrder: number;
};

export function buildDefaultPagePermissionSeeds(): PagePermissionSeed[] {
	const seeds: PagePermissionSeed[] = [];
	let sortOrder = 0;

	for (const section of PERMISSION_SECTIONS) {
		const routePattern = SECTION_ROUTE_PATTERNS[section];
		const sectionLabel = PERMISSION_SECTION_LABELS[section];

		for (const action of PERMISSION_ACTIONS) {
			seeds.push({
				slug: `${section}.${action}`,
				name: `${sectionLabel}: ${action}`,
				routePattern,
				section,
				action,
				description: `${action} access for ${sectionLabel}`,
				sortOrder
			});
			sortOrder += 1;
		}
	}

	return seeds;
}
