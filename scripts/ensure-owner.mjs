/**
 * Promote the oldest auth_user to owner when no owner exists.
 * Usage: npm run db:ensure-owner
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

function loadEnv() {
	try {
		const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
		for (const line of raw.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq <= 0) continue;
			const key = trimmed.slice(0, eq).trim();
			let value = trimmed.slice(eq + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (!(key in process.env)) process.env[key] = value;
		}
	} catch {
		// .env optional if DATABASE_URL already set
	}
}

loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const sql = neon(url);

const owners = await sql`SELECT id, email FROM auth_user WHERE role = 'owner' LIMIT 1`;
if (owners.length > 0) {
	console.log(`Owner already set: ${owners[0].email} (${owners[0].id})`);
	process.exit(0);
}

const oldest = await sql`
	SELECT id, email FROM auth_user
	ORDER BY created_at ASC
	LIMIT 1
`;

if (oldest.length === 0) {
	console.log('No users in auth_user. Invite or create a user first.');
	process.exit(0);
}

await sql`
	UPDATE auth_user
	SET role = 'owner', permissions = NULL, updated_at = NOW()
	WHERE id = ${oldest[0].id}
`;

console.log(`Promoted first user to owner: ${oldest[0].email} (${oldest[0].id})`);
