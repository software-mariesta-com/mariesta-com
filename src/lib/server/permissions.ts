import type { AuthRole } from '#lib/server/db/schema/enums';
import {
	defaultMemberPermissions,
	fullPermissions,
	type PermissionAction,
	type PermissionSection,
	type SectionPermissions,
	type UserPermissions
} from '#lib/constants/permissions';

export type AuthzUser = {
	id: string;
	role?: AuthRole | string | null;
	permissions?: UserPermissions | null;
	twoFactorEnabled?: boolean | null;
};

export function normalizeRole(role: unknown): AuthRole {
	if (role === 'owner' || role === 'admin' || role === 'member') return role;
	return 'member';
}

export function resolvePermissions(user: AuthzUser): UserPermissions {
	const role = normalizeRole(user.role);
	if (role === 'owner' || role === 'admin') {
		return fullPermissions();
	}
	return {
		...defaultMemberPermissions(),
		...(user.permissions ?? {})
	};
}

export function getSectionPermissions(
	user: AuthzUser,
	section: PermissionSection
): SectionPermissions {
	const resolved = resolvePermissions(user);
	return (
		resolved[section] ?? {
			view: section === 'profile',
			create: false,
			update: false,
			delete: false
		}
	);
}

export function can(
	user: AuthzUser,
	section: PermissionSection,
	action: PermissionAction
): boolean {
	return Boolean(getSectionPermissions(user, section)[action]);
}

/** Mutations require both permission and 2FA. */
export function canMutate(
	user: AuthzUser,
	section: PermissionSection,
	action: Exclude<PermissionAction, 'view'>
): boolean {
	return Boolean(user.twoFactorEnabled) && can(user, section, action);
}

export function buildCapabilities(user: AuthzUser): Record<
	PermissionSection,
	SectionPermissions & { mutate: boolean }
> {
	const twoFa = Boolean(user.twoFactorEnabled);
	const caps = {} as Record<PermissionSection, SectionPermissions & { mutate: boolean }>;
	for (const section of Object.keys(fullPermissions()) as PermissionSection[]) {
		const perms = getSectionPermissions(user, section);
		caps[section] = {
			...perms,
			create: perms.create && twoFa,
			update: perms.update && twoFa,
			delete: perms.delete && twoFa,
			mutate: twoFa && (perms.create || perms.update || perms.delete)
		};
	}
	return caps;
}
