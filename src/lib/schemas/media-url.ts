import { z } from 'zod';

/** Absolute http(s) URL or app-proxied `/api/media/...` path. */
export const mediaUrlSchema = z
	.string()
	.trim()
	.optional()
	.nullable()
	.transform((v) => (!v ? null : v))
	.pipe(
		z
			.string()
			.nullable()
			.refine(
				(v) =>
					v === null ||
					v.startsWith('/api/media/') ||
					/^https?:\/\//i.test(v),
				{ message: 'Invalid media URL' }
			)
	);
