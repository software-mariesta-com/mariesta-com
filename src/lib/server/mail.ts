import {
	CONTACT_TO,
	SMTP_FROM,
	SMTP_HOST,
	SMTP_PASS,
	SMTP_PORT,
	SMTP_USER
} from '$app/env/private';
import nodemailer from 'nodemailer';

/** Pull address from `Name <email@x.com>` or return trimmed raw. */
export function extractEmailAddress(value: string) {
	const match = value.match(/<([^>\s]+)>/);
	return (match?.[1] ?? value).trim();
}

export function isSmtpConfigured() {
	return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM);
}

function createTransport() {
	if (!isSmtpConfigured()) return null;

	const port = Number(SMTP_PORT ?? '587');
	// Gmail app passwords are often pasted with spaces; strip for auth.
	const pass = String(SMTP_PASS).replace(/\s+/g, '');

	return nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		auth: {
			user: SMTP_USER,
			pass
		}
	});
}

export async function sendMail({
	to,
	subject,
	text,
	html,
	replyTo,
	logLabel = 'mail'
}: {
	to: string;
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
	logLabel?: string;
}) {
	const transport = createTransport();
	if (!transport || !SMTP_FROM) {
		console.info(
			`[${logLabel}] Email to ${to} (SMTP not configured).\nSubject: ${subject}\n${text}`
		);
		return { delivered: false as const };
	}

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject,
		text,
		html: html ?? text.replace(/\n/g, '<br>'),
		replyTo
	});
	return { delivered: true as const };
}

export function resolveContactInbox() {
	const raw = CONTACT_TO?.trim() || SMTP_FROM?.trim();
	if (!raw) return null;
	return extractEmailAddress(raw);
}

export async function sendAuthEmail({
	to,
	subject,
	text,
	html
}: {
	to: string;
	subject: string;
	text: string;
	html?: string;
}) {
	const result = await sendMail({ to, subject, text, html, logLabel: 'auth' });
	if (!result.delivered) {
		// Auth still proceeds when SMTP is missing (dev logs the code).
		return;
	}
}

export async function sendOtpEmail({
	email,
	otp,
	type
}: {
	email: string;
	otp: string;
	type: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';
}) {
	const titles: Record<typeof type, string> = {
		'sign-in': 'Your MARIESTA sign-in code',
		'email-verification': 'Verify your MARIESTA email',
		'forget-password': 'Reset your MARIESTA password',
		'change-email': 'Confirm your MARIESTA email change'
	};

	const subject = titles[type];
	const text = [
		`Your MARIESTA code is: ${otp}`,
		'',
		'This code expires in 3 minutes.',
		'If you did not request this, you can ignore this email.'
	].join('\n');

	await sendAuthEmail({ to: email, subject, text });
}
