import { z } from 'zod';
import {
	PERMISSION_SECTIONS,
	defaultMemberPermissions,
	type UserPermissions
} from '#lib/constants/permissions';

export const authRoleSchema = z.enum(['owner', 'admin', 'member']);
export const inviteRoleSchema = z.enum(['admin', 'member']);

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
		return defaultMemberPermissions();
	}
	return { ...defaultMemberPermissions(), ...parsed.data };
}

export const inviteUserSchema = z.object({
	name: z.string().trim().min(1).max(200),
	email: z.string().trim().email().max(320),
	role: inviteRoleSchema.default('member'),
	permissions: userPermissionsSchema
});

export const updateAuthUserSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1).max(200).optional(),
	role: inviteRoleSchema.optional(),
	permissions: userPermissionsSchema
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateAuthUserInput = z.infer<typeof updateAuthUserSchema>;
