import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { contactFormSchema, contactTopicLabels } from '#lib/schemas/contact';
import { resolveContactInbox, sendMail } from '#lib/server/mail';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body.' }, { status: 400 });
	}

	const parsed = contactFormSchema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message ?? 'Invalid form data.';
		return json({ error: message }, { status: 400 });
	}

	const data = parsed.data;
	if (data.website && data.website.trim().length > 0) {
		// Honeypot filled: pretend success.
		return json({ ok: true });
	}

	const inbox = resolveContactInbox();
	if (!inbox) {
		return json(
			{ error: 'Contact inbox is not configured. Please try again later.' },
			{ status: 503 }
		);
	}

	const topicLabel = contactTopicLabels[data.topic];
	const orgLine = data.organization?.trim()
		? `Organization: ${data.organization.trim()}`
		: 'Organization: (not provided)';

	const text = [
		'New message from mariesta.com/contact',
		'',
		`Topic: ${topicLabel}`,
		`Name: ${data.name}`,
		`Email: ${data.email}`,
		orgLine,
		'',
		'Message:',
		data.message
	].join('\n');

	try {
		const result = await sendMail({
			to: inbox,
			subject: `[MARIESTA Contact] ${topicLabel}: ${data.name}`,
			text,
			replyTo: data.email,
			logLabel: 'contact'
		});
		if (!result.delivered) {
			return json(
				{ error: 'Email delivery is not configured. Please try again later.' },
				{ status: 503 }
			);
		}
	} catch (err) {
		console.error('[contact] Failed to send mail', err);
		return json({ error: 'Could not send your message. Please try again.' }, { status: 502 });
	}

	return json({ ok: true });
};
