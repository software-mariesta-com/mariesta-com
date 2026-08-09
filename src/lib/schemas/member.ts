import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { mediaUrlSchema } from '#lib/schemas/media-url';
import { optionalLinkUrlSchema } from '#lib/schemas/optional-link-url';
import { publishStatusSchema } from '#lib/schemas/publish-status';

export const createMemberSchema = z.object({
	departmentId: uuidSchema,
	name: z.string().trim().min(1).max(200),
	role: z.string().trim().min(1).max(200),
	photoUrl: mediaUrlSchema,
	linkUrl: optionalLinkUrlSchema,
	status: publishStatusSchema.default('draft')
});

export const updateMemberSchema = createMemberSchema.partial().extend({
	id: uuidSchema
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
