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
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
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
	AWS_ACCESS_KEY_ID: {
		description: 'Tigris / S3 access key ID for object storage uploads.',
		schema: optionalString
	},
	AWS_SECRET_ACCESS_KEY: {
		description: 'Tigris / S3 secret access key for object storage uploads.',
		schema: optionalString
	},
	AWS_ENDPOINT_URL_S3: {
		description: 'Tigris S3 endpoint URL (e.g. `https://t3.storage.dev`).',
		schema: optionalString
	},
	AWS_REGION: {
		description: 'Tigris / S3 region. Use `auto` for Tigris.',
		schema: optionalString
	},
	BUCKET_NAME: {
		description: 'Tigris bucket name for uploaded images.',
		schema: optionalString
	}
});
