import { z } from 'zod';
import { PERMISSION_SECTIONS, type UserPermissions } from '#lib/constants/permissions';
import { uuidSchema } from '#lib/schemas/common';

export const roleSlugSchema = z
	.string()
	.trim()
	.min(2)
	.max(50)
	.regex(/^[a-z][a-z0-9_]*$/, 'Slug must be lowercase letters, numbers, or underscores');

const sectionPermissionsSchema = z.object({
	view: z.boolean(),
	create: z.boolean(),
	update: z.boolean(),
	delete: z.boolean()
});

export const rolePermissionsSchema = z
	.partialRecord(z.enum(PERMISSION_SECTIONS), sectionPermissionsSchema)
	.optional()
	.nullable();

export const createRoleSchema = z.object({
	slug: roleSlugSchema,
	name: z.string().trim().min(1).max(100),
	description: z.string().trim().max(500).optional().nullable(),
	permissions: rolePermissionsSchema,
	permissionIds: z.array(uuidSchema).optional()
});

export const updateRoleSchema = z.object({
	id: uuidSchema,
	slug: roleSlugSchema.optional(),
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional().nullable(),
	permissions: rolePermissionsSchema,
	permissionIds: z.array(uuidSchema).optional()
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export function parseRolePermissions(value: unknown): UserPermissions | null {
	const parsed = rolePermissionsSchema.safeParse(value);
	if (!parsed.success) return null;
	return parsed.data ?? null;
}
