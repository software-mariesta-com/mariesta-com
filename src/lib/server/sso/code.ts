import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '#lib/server/db';
import { verification } from '#lib/server/db/schema';
import { getSsoHmacSecret } from './env';

const SSO_TTL_MS = 120_000;
const SSO_PREFIX = 'sso:';

function hmacSign(message: string): string {
	return createHmac('sha256', getSsoHmacSecret()).update(message).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

/**
 * Mint a short-lived one-time SSO code bound to a session token (localhost / cross-origin handoff).
 * Format: `{id}.{expMs}.{hmac}`
 */
export async function mintSsoCode(sessionToken: string): Promise<string> {
	const id = randomUUID();
	const expMs = Date.now() + SSO_TTL_MS;
	const now = new Date();

	await db.insert(verification).values({
		id,
		identifier: `${SSO_PREFIX}${id}`,
		value: sessionToken,
		expiresAt: new Date(expMs),
		createdAt: now,
		updatedAt: now
	});

	const sig = hmacSign(`${id}.${expMs}`);
	return `${id}.${expMs}.${sig}`;
}

/**
 * Verify and consume a one-time SSO code. Returns the session token or null.
 */
export async function redeemSsoCode(code: string): Promise<string | null> {
	const parts = code.split('.');
	if (parts.length !== 3) return null;
	const [id, expStr, sig] = parts;
	if (!id || !expStr || !sig) return null;

	const expMs = Number(expStr);
	if (!Number.isFinite(expMs) || Date.now() > expMs) return null;
	if (!safeEqual(sig, hmacSign(`${id}.${expMs}`))) return null;

	const identifier = `${SSO_PREFIX}${id}`;
	const rows = await db
		.select()
		.from(verification)
		.where(and(eq(verification.id, id), eq(verification.identifier, identifier)))
		.limit(1);

	const row = rows[0];
	if (!row) return null;
	if (row.expiresAt.getTime() < Date.now()) {
		await db.delete(verification).where(eq(verification.id, id));
		return null;
	}

	await db.delete(verification).where(eq(verification.id, id));
	return row.value;
}
