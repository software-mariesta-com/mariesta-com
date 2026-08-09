import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { publishStatusSchema } from '#lib/schemas/publish-status';

export const createFacilitySchema = z.object({
	businessId: uuidSchema,
	name: z.string().trim().min(1).max(200),
	status: publishStatusSchema.default('draft')
});

export const updateFacilitySchema = createFacilitySchema.partial().extend({
	id: uuidSchema
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
