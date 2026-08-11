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
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation). Must match Menzies when sharing the auth DB / session.'
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
	}
});
