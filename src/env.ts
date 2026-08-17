import { defineEnvVars } from '@sveltejs/kit/env';

function optionalString(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens and as legacy fallback when decrypting data encrypted before versioned rotation. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation). Must match Menzies when sharing the auth DB / session.'
	},
	BETTER_AUTH_SECRETS: {
		description:
			'Optional versioned secrets for non-destructive BETTER_AUTH_SECRET rotation (e.g. `2:new-secret,1:old-secret`). First entry encrypts new data; later entries decrypt old envelopes. When rotating, keep the previous secret in BETTER_AUTH_SECRET for bare-hex legacy rows (2FA TOTP secrets, backup codes). Must match Menzies when sharing the auth DB.',
		schema: optionalString
	},
	/**
	 * Comma-separated trusted website origins for Better Auth + SSO redirect allowlist
	 * (e.g. `https://menzies.mariesta.com,http://localhost:5174`).
	 * Prefer this over TRUSTED_ORIGINS when both are set.
	 */
	SSO_TRUSTED_ORIGINS: {
		description:
			'Comma-separated trusted origins for SSO redirects and Better Auth trustedOrigins (e.g. Menzies prod + local).',
		schema: optionalString
	},
	TRUSTED_ORIGINS: {
		description:
			'Alias for SSO_TRUSTED_ORIGINS. Comma-separated trusted website origins.',
		schema: optionalString
	},
	AUTH_COOKIE_DOMAIN: {
		description:
			'Optional session cookie Domain for sibling SSO (e.g. `.mariesta.com`). Leave empty on localhost.',
		schema: optionalString
	},
	AUTH_SESSION_EXPIRES_IN: {
		description:
			'Max session lifetime (e.g. `2h`, `7200`, or seconds). Default: `2h`. See Better Auth session config.',
		schema: optionalString
	},
	AUTH_SESSION_UPDATE_AGE: {
		description:
			'Extend session expiry when active (e.g. `1h`, `3600`). Default: `1h`. See Better Auth session config.',
		schema: optionalString
	},
	AUTH_SESSION_COOKIE_CACHE_ENABLED: {
		description:
			'Cache session in cookie for faster getSession. Default: `false` so role/permission revokes apply immediately.',
		schema: optionalString
	},
	AUTH_SESSION_COOKIE_CACHE_MAX_AGE: {
		description: 'Cookie session cache TTL (e.g. `30m`, `1800`). Default: `30m`.',
		schema: optionalString
	},
	AUTH_SESSION_SECURE_COOKIES: {
		description:
			'Force Secure session cookies (`true`/`false`). Unset = auto from ORIGIN (https → secure).',
		schema: optionalString
	},
	SSO_HMAC_SECRET: {
		description:
			'HMAC secret for one-time SSO code handoff (localhost / cross-origin). Rotate anytime via env. Falls back to a derivation of BETTER_AUTH_SECRET when unset. Must match Menzies.',
		schema: optionalString
	},
	GITHUB_CLIENT_ID: {
		description:
			'Optional GitHub OAuth client ID. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).',
		schema: optionalString
	},
	GITHUB_CLIENT_SECRET: {
		description:
			'Optional GitHub OAuth client secret. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).',
		schema: optionalString
	},
	SMTP_HOST: {
		description: 'SMTP host for auth emails. Use `smtp.gmail.com` for Gmail.',
		schema: optionalString
	},
	SMTP_PORT: {
		description: 'SMTP port. Gmail: `587` (STARTTLS) or `465` (SSL).',
		schema: optionalString
	},
	SMTP_USER: {
		description: 'SMTP username (your full Gmail address).',
		schema: optionalString
	},
	SMTP_PASS: {
		description:
			'SMTP password. For Gmail use an [App Password](https://myaccount.google.com/apppasswords), not your normal password.',
		schema: optionalString
	},
	SMTP_FROM: {
		description: 'From address for auth emails (usually the same as SMTP_USER for Gmail).',
		schema: optionalString
	},
	CONTACT_TO: {
		description:
			'Inbox for public contact form messages. Falls back to SMTP_FROM when unset.',
		schema: optionalString
	},
	CONTACT_PUBLIC_EMAIL: {
		description:
			'Public contact email shown on /contact (e.g. hello@mariesta.com). Optional.',
		schema: optionalString
	},
	// Named TIGRIS_* (not AWS_*) so Netlify accepts them; AWS_* is reserved there.
	TIGRIS_ACCESS_KEY_ID: {
		description: 'Tigris / S3 access key ID for object storage uploads.',
		schema: optionalString
	},
	TIGRIS_SECRET_ACCESS_KEY: {
		description: 'Tigris / S3 secret access key for object storage uploads.',
		schema: optionalString
	},
	TIGRIS_ENDPOINT_URL: {
		description: 'Tigris S3 endpoint URL (e.g. `https://t3.storage.dev`).',
		schema: optionalString
	},
	TIGRIS_REGION: {
		description: 'Tigris / S3 region. Use `auto` for Tigris.',
		schema: optionalString
	},
	TIGRIS_BUCKET_NAME: {
		description: 'Tigris bucket name for uploaded images.',
		schema: optionalString
	},
	TIER_CHANGE_URL: {
		description:
			'External URL where users can view pricing or change their subscription tier. Defaults to ORIGIN/home when unset.',
		schema: optionalString
	},
	BROWSE_PLANS_URL: {
		description:
			'External URL for browsing software plans (e.g. Menzies store). Defaults to the first SSO_TRUSTED_ORIGINS entry when unset.',
		schema: optionalString
	}
});
