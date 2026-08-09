import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { publishStatusSchema } from '#lib/schemas/publish-status';

export const createDepartmentSchema = z.object({
	facilityId: uuidSchema,
	name: z.string().trim().min(1).max(200),
	status: publishStatusSchema.default('draft')
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
	id: uuidSchema
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
