import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import {
	AWS_ACCESS_KEY_ID,
	AWS_ENDPOINT_URL_S3,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY,
	BUCKET_NAME
} from '$app/env/private';

function requireEnv(name: string, value: string | undefined): string {
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

function getClient() {
	return new S3Client({
		region: AWS_REGION || 'auto',
		endpoint: requireEnv('AWS_ENDPOINT_URL_S3', AWS_ENDPOINT_URL_S3),
		credentials: {
			accessKeyId: requireEnv('AWS_ACCESS_KEY_ID', AWS_ACCESS_KEY_ID),
			secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY', AWS_SECRET_ACCESS_KEY)
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
	const idx =
		membersIdx >= 0 && partnersIdx >= 0
			? Math.min(membersIdx, partnersIdx)
			: Math.max(membersIdx, partnersIdx);
	if (idx < 0) return stored;

	return mediaPublicUrl(stored.slice(idx).split('?')[0]!);
}

export async function uploadObject(
	key: string,
	body: Uint8Array | Buffer,
	contentType: string
): Promise<{ key: string; url: string }> {
	const bucket = requireEnv('BUCKET_NAME', BUCKET_NAME);
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
	const bucket = requireEnv('BUCKET_NAME', BUCKET_NAME);
	const client = getClient();

	return client.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: key
		})
	);
}

export async function deleteObject(key: string): Promise<void> {
	const bucket = requireEnv('BUCKET_NAME', BUCKET_NAME);
	const client = getClient();

	await client.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: key
		})
	);
}
