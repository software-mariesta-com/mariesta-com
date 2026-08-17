import { z } from 'zod';
import {
	PERMISSION_ACTIONS,
	PERMISSION_SECTIONS,
	type PermissionAction,
	type PermissionSection
} from '#lib/constants/permissions';
import { uuidSchema } from '#lib/schemas/common';

export const pagePermissionSlugSchema = z
	.string()
	.trim()
	.min(2)
	.max(80)
	.regex(/^[a-z][a-z0-9_.]*$/, 'Slug must be lowercase letters, numbers, dots, or underscores');

export const createPagePermissionSchema = z.object({
	slug: pagePermissionSlugSchema,
	name: z.string().trim().min(1).max(120),
	routePattern: z.string().trim().min(1).max(200),
	section: z.enum(PERMISSION_SECTIONS),
	action: z.enum(PERMISSION_ACTIONS),
	description: z.string().trim().max(500).optional().nullable(),
	sortOrder: z.number().int().min(0).max(9999).optional()
});

export const updatePagePermissionSchema = z.object({
	id: uuidSchema,
	slug: pagePermissionSlugSchema.optional(),
	name: z.string().trim().min(1).max(120).optional(),
	routePattern: z.string().trim().min(1).max(200).optional(),
	section: z.enum(PERMISSION_SECTIONS).optional(),
	action: z.enum(PERMISSION_ACTIONS).optional(),
	description: z.string().trim().max(500).optional().nullable(),
	sortOrder: z.number().int().min(0).max(9999).optional()
});

export type CreatePagePermissionInput = z.infer<typeof createPagePermissionSchema>;
export type UpdatePagePermissionInput = z.infer<typeof updatePagePermissionSchema>;
export type PagePermissionSection = PermissionSection;
export type PagePermissionAction = PermissionAction;
