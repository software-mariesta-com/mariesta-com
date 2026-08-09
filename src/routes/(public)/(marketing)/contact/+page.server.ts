import { CONTACT_PUBLIC_EMAIL } from '$app/env/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		publicEmail: CONTACT_PUBLIC_EMAIL?.trim() || 'hello@mariesta.com'
	};
};
