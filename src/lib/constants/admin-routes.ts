export const ADMIN_ROUTES = {
	dashboard: '/dashboard',
	businesses: '/businesses',
	facilities: '/facilities',
	departments: '/departments',
	members: '/members',
	partners: '/partners',
	careers: '/job-posts',
	users: '/users',
	profile: '/profile'
} as const;

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;

