export const PERMISSION_SECTIONS = [
	'dashboard',
	'businesses',
	'facilities',
	'departments',
	'members',
	'partners',
	'careers',
	'users',
	'profile'
] as const;

export type PermissionSection = (typeof PERMISSION_SECTIONS)[number];

export const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type SectionPermissions = Record<PermissionAction, boolean>;
export type UserPermissions = Partial<Record<PermissionSection, SectionPermissions>>;

export const PERMISSION_SECTION_LABELS: Record<PermissionSection, string> = {
	dashboard: 'Dashboard',
	businesses: 'Businesses',
	facilities: 'Facilities',
	departments: 'Departments',
	members: 'Members',
	partners: 'Partners',
	careers: 'Careers',
	users: 'Users',
	profile: 'Profile'
};

/** Sections shown in the admin sidebar (profile lives in the footer). */
export const SIDEBAR_SECTIONS = [
	'dashboard',
	'businesses',
	'facilities',
	'departments',
	'members',
	'partners',
	'careers',
	'users'
] as const satisfies readonly PermissionSection[];

export function emptySectionPermissions(): SectionPermissions {
	return { view: false, create: false, update: false, delete: false };
}

export function fullSectionPermissions(): SectionPermissions {
	return { view: true, create: true, update: true, delete: true };
}

export function defaultMemberPermissions(): UserPermissions {
	const permissions: UserPermissions = {};
	for (const section of PERMISSION_SECTIONS) {
		permissions[section] =
			section === 'profile'
				? { view: true, create: false, update: false, delete: false }
				: emptySectionPermissions();
	}
	return permissions;
}

export function fullPermissions(): UserPermissions {
	const permissions: UserPermissions = {};
	for (const section of PERMISSION_SECTIONS) {
		permissions[section] = fullSectionPermissions();
	}
	return permissions;
}
