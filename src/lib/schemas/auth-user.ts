import { z } from 'zod';
import {
	PERMISSION_SECTIONS,
	defaultUserPermissions,
	type UserPermissions
} from '#lib/constants/permissions';
import { roleSlugSchema } from '#lib/schemas/role';

export const authRoleSchema = z.enum(['owner', 'admin', 'user', 'member']);
export const inviteRoleSchema = z.enum(['admin', 'user', 'member']);

const sectionPermissionsSchema = z.object({
	view: z.boolean(),
	create: z.boolean(),
	update: z.boolean(),
	delete: z.boolean()
});

export const userPermissionsSchema = z
	.partialRecord(z.enum(PERMISSION_SECTIONS), sectionPermissionsSchema)
	.optional()
	.nullable();

export function parsePermissions(value: unknown): UserPermissions {
	const parsed = userPermissionsSchema.safeParse(value);
	if (!parsed.success || !parsed.data) {
		return defaultUserPermissions();
	}
	return { ...defaultUserPermissions(), ...parsed.data };
}

export const inviteUserSchema = z.object({
	name: z.string().trim().min(1).max(200),
	email: z.string().trim().email().max(320),
	role: roleSlugSchema.default('user')
});

export const updateAuthUserSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1).max(200).optional(),
	role: roleSlugSchema.optional()
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateAuthUserInput = z.infer<typeof updateAuthUserSchema>;
