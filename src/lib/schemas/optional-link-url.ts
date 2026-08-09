import { z } from 'zod';

/** Optional absolute http(s) URL for external links. Empty → null. */
export const optionalLinkUrlSchema = z
	.string()
	.trim()
	.optional()
	.nullable()
	.transform((v) => (!v ? null : v))
	.pipe(
		z
			.string()
			.nullable()
			.refine((v) => v === null || /^https?:\/\//i.test(v), {
				message: 'Link must be an http(s) URL'
			})
	);
