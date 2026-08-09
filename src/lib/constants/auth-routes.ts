export const AUTH_ROUTES = {
	login: '/auth/login',
	signUp: '/auth/sign-up',
	forgotPassword: '/auth/forgot-password',
	resetPassword: '/auth/reset-password',
	twoFactor: '/auth/two-factor',
	otp: '/auth/otp',
	dashboard: '/dashboard',
	profile: '/profile',
	settings: '/settings',
	logout: '/api/logout'
} as const;

export function loginRedirectUrl(pathname: string) {
	return `${AUTH_ROUTES.login}?redirectTo=${encodeURIComponent(pathname)}`;
}

export function otpRedirectUrl(email: string, type: 'email-verification' | 'forget-password' = 'email-verification') {
	const params = new URLSearchParams({ email, type });
	return `${AUTH_ROUTES.otp}?${params.toString()}`;
}
