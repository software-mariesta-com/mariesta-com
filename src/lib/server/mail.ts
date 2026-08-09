import {
	SMTP_FROM,
	SMTP_HOST,
	SMTP_PASS,
	SMTP_PORT,
	SMTP_USER
} from '$app/env/private';
import nodemailer from 'nodemailer';

export function isSmtpConfigured() {
	return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM);
}

function createTransport() {
	if (!isSmtpConfigured()) return null;

	const port = Number(SMTP_PORT ?? '587');
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS
		}
	});
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
	const transport = createTransport();
	if (!transport || !SMTP_FROM) {
		console.info(`[auth] Email to ${to} (SMTP not configured).\nSubject: ${subject}\n${text}`);
		return;
	}

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject,
		text,
		html: html ?? text.replace(/\n/g, '<br>')
	});
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
