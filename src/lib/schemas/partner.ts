import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { mediaUrlSchema } from '#lib/schemas/media-url';
import { optionalLinkUrlSchema } from '#lib/schemas/optional-link-url';
import { publishStatusSchema } from '#lib/schemas/publish-status';

export const createPartnerSchema = z.object({
	name: z.string().trim().min(1).max(200),
	logoUrl: mediaUrlSchema,
	linkUrl: optionalLinkUrlSchema,
	status: publishStatusSchema.default('draft'),
	sortOrder: z.coerce.number().int().default(0)
});

export const updatePartnerSchema = createPartnerSchema.partial().extend({
	id: uuidSchema
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
