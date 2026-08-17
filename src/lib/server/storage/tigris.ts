import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import {
	TIGRIS_ACCESS_KEY_ID,
	TIGRIS_BUCKET_NAME,
	TIGRIS_ENDPOINT_URL,
	TIGRIS_REGION,
	TIGRIS_SECRET_ACCESS_KEY
} from '$app/env/private';

function requireEnv(name: string, value: string | undefined): string {
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

function getClient() {
	return new S3Client({
		region: TIGRIS_REGION || 'auto',
		endpoint: requireEnv('TIGRIS_ENDPOINT_URL', TIGRIS_ENDPOINT_URL),
		credentials: {
			accessKeyId: requireEnv('TIGRIS_ACCESS_KEY_ID', TIGRIS_ACCESS_KEY_ID),
			secretAccessKey: requireEnv('TIGRIS_SECRET_ACCESS_KEY', TIGRIS_SECRET_ACCESS_KEY)
		},
		// Bucket names with dots break virtual-hosted SSL; path-style keeps Put/Get working.
		forcePathStyle: true
	});
}

/** App URL that streams the object (works with private buckets and dotted bucket names). */
export function mediaPublicUrl(key: string): string {
	return `/api/media/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * Normalize a stored photo/logo value to a browser-safe `/api/media/...` URL.
 * Accepts raw keys or older absolute Tigris API URLs.
 */
export function toMediaUrl(stored: string | null | undefined): string | null {
	if (!stored) return null;
	if (stored.startsWith('/api/media/')) return stored;

	const membersIdx = stored.indexOf('members/');
	const partnersIdx = stored.indexOf('partners/');
	const avatarsIdx = stored.indexOf('avatars/');
	const idx = [membersIdx, partnersIdx, avatarsIdx]
		.filter((i) => i >= 0)
		.reduce((min, i) => (min < 0 ? i : Math.min(min, i)), -1);
	if (idx < 0) return stored;

	return mediaPublicUrl(stored.slice(idx).split('?')[0]!);
}

/** Extract a Tigris object key from a stored media URL or raw key. */
export function mediaKeyFromStored(stored: string | null | undefined): string | null {
	if (!stored) return null;
	if (stored.startsWith('/api/media/')) {
		return stored
			.slice('/api/media/'.length)
			.split('/')
			.map((segment) => decodeURIComponent(segment))
			.join('/');
	}

	const membersIdx = stored.indexOf('members/');
	const partnersIdx = stored.indexOf('partners/');
	const avatarsIdx = stored.indexOf('avatars/');
	const idx = [membersIdx, partnersIdx, avatarsIdx]
		.filter((i) => i >= 0)
		.reduce((min, i) => (min < 0 ? i : Math.min(min, i)), -1);
	if (idx < 0) return null;

	return stored.slice(idx).split('?')[0] ?? null;
}

export async function uploadObject(
	key: string,
	body: Uint8Array | Buffer,
	contentType: string
): Promise<{ key: string; url: string }> {
	const bucket = requireEnv('TIGRIS_BUCKET_NAME', TIGRIS_BUCKET_NAME);
	const client = getClient();

	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: contentType
		})
	);

	return { key, url: mediaPublicUrl(key) };
}

export async function getObject(key: string) {
	const bucket = requireEnv('TIGRIS_BUCKET_NAME', TIGRIS_BUCKET_NAME);
	const client = getClient();

	return client.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: key
		})
	);
}

export async function deleteObject(key: string): Promise<void> {
	const bucket = requireEnv('TIGRIS_BUCKET_NAME', TIGRIS_BUCKET_NAME);
	const client = getClient();

	await client.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: key
		})
	);
}
