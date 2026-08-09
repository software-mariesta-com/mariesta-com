import { z } from 'zod';

export const contactTopics = [
	'general',
	'partnership',
	'press',
	'careers',
	'business',
	'other'
] as const;

export type ContactTopic = (typeof contactTopics)[number];

export const contactTopicLabels: Record<ContactTopic, string> = {
	general: 'General inquiry',
	partnership: 'Partnership',
	press: 'Press and media',
	careers: 'Careers',
	business: 'Business / group',
	other: 'Other'
};

export const contactFormSchema = z.object({
	name: z.string().trim().min(2, 'Name is required').max(120),
	email: z.string().trim().email('Enter a valid email').max(254),
	organization: z.string().trim().max(160).optional(),
	topic: z.enum(contactTopics),
	message: z.string().trim().min(20, 'Please share a bit more detail').max(5000),
	/** Honeypot. Must stay empty. */
	website: z.string().optional().default('')
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
