import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getObject } from '#lib/server/storage/tigris';

const ALLOWED_PREFIX = /^(members|partners)\//;

export const GET: RequestHandler = async ({ params }) => {
	const keyParam = params.key;
	const key = Array.isArray(keyParam) ? keyParam.join('/') : keyParam;

	if (!key || !ALLOWED_PREFIX.test(key) || key.includes('..')) {
		error(404, 'Not found');
	}

	try {
		const object = await getObject(key);
		const body = object.Body;
		if (!body) error(404, 'Not found');

		const bytes = await body.transformToByteArray();
		return new Response(Buffer.from(bytes), {
			headers: {
				'Content-Type': object.ContentType || 'application/octet-stream',
				'Cache-Control': 'public, max-age=604800, stale-while-revalidate=2592000',
				...(object.ETag ? { ETag: object.ETag } : {})
			}
		});
	} catch (err) {
		console.error('Media fetch failed', err);
		error(404, 'Not found');
	}
};
