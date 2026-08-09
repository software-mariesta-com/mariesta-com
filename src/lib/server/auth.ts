import {
	ORIGIN,
	BETTER_AUTH_SECRET,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET
} from '$app/env/private';

import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { emailOTP, twoFactor } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import { OTP_EXPIRES_IN_SEC, OTP_LENGTH } from '#lib/constants/otp';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { ensureOwnerExists } from '#lib/server/ensure-owner';
import { sendAuthEmail, sendOtpEmail } from '#lib/server/mail';

const githubEnabled = Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	appName: 'MARIESTA',
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'member',
				input: false
			},
			permissions: {
				type: 'json',
				required: false,
				input: false
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			void sendAuthEmail({
				to: user.email,
				subject: 'Set your MARIESTA password',
				text: [
					`Hi ${user.name},`,
					'',
					'Use this link to set or reset your password:',
					url,
					'',
					'If you did not expect this email, you can ignore it.'
				].join('\n')
			});
		}
	},
	emailVerification: {
		autoSignInAfterVerification: true
	},
	...(githubEnabled
		? {
				socialProviders: {
					github: {
						clientId: GITHUB_CLIENT_ID!,
						clientSecret: GITHUB_CLIENT_SECRET!,
						disableSignUp: true,
						disableImplicitSignUp: true
					}
				}
			}
		: {}),
	databaseHooks: {
		user: {
			create: {
				after: async () => {
					await ensureOwnerExists();
				}
			}
		}
	},
	plugins: [
		emailOTP({
			otpLength: OTP_LENGTH,
			expiresIn: OTP_EXPIRES_IN_SEC,
			sendVerificationOnSignUp: false,
			disableSignUp: true,
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				void sendOtpEmail({ email, otp, type });
			}
		}),
		twoFactor({
			issuer: 'MARIESTA'
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export const authConfig = {
	githubEnabled,
	defaultCallbackURL: AUTH_ROUTES.dashboard
};
