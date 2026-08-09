import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { optionalLinkUrlSchema } from '#lib/schemas/optional-link-url';
import { publishStatusSchema } from '#lib/schemas/publish-status';

export const createBusinessSchema = z.object({
	name: z.string().trim().min(1).max(200),
	category: z.string().trim().min(1).max(100),
	blurb: z.string().trim().min(1).max(500),
	linkUrl: optionalLinkUrlSchema,
	status: publishStatusSchema.default('draft')
});

export const updateBusinessSchema = createBusinessSchema.partial().extend({
	id: uuidSchema
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
