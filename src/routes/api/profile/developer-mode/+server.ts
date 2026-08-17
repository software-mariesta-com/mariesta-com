import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { require2FA, requireApiUser } from '#lib/server/api-auth';
import { updateDeveloperModeSchema } from '#lib/schemas/profile';
import { updateDeveloperMode } from '#lib/remotes/profile.remote';

export const PATCH: RequestHandler = async (event) => {
	const actor = await requireApiUser(event);
	require2FA(actor);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const parsed = updateDeveloperModeSchema.safeParse({
		userId: actor.id,
		...(typeof body === 'object' && body !== null ? body : {})
	});

	if (!parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Invalid request');
	}

	const result = await updateDeveloperMode(parsed.data);
	return json(result);
};
