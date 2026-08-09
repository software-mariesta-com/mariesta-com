<script lang="ts">
	import { enhance } from '$app/forms';
	import MailCheck from '@lucide/svelte/icons/mail-check';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import OtpCodeField from '#lib/components/OtpCodeField.svelte';
	import OtpResendControls from '#lib/components/OtpResendControls.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const email = $derived(form?.email ?? data.email);
	const toastMessage = $derived(form?.message ?? form?.success ?? null);
	const toastKind = $derived<'success' | 'error'>(form?.success ? 'success' : 'error');
</script>

<svelte:head>
	<title>Verify email | MARIESTA</title>
	<meta name="description" content="Enter the MARIESTA email verification code." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="card bg-base-100 card-border shadow-sm">
	<div class="card-body gap-5">
		<h1 class="card-title text-primary font-bold">Verify email</h1>

		<form method="POST" action="?/verify" class="grid gap-4" use:enhance>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Email<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
				</legend>
				<input
					id="otp-email"
					class="input w-full cursor-text"
					name="email"
					type="email"
					autocomplete="email"
					value={email}
					required
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Code<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
				</legend>
				<OtpCodeField id="otp-code" name="otp" />
			</fieldset>

			<button class="btn btn-primary cursor-pointer" type="submit">
				<MailCheck class="h-4 w-4" aria-hidden="true" />
				Verify
			</button>
		</form>

		<OtpResendControls email={email} />

		<div class="text-sm">
			<a class="link link-hover cursor-pointer" href={AUTH_ROUTES.login}>Back to login</a>
		</div>
	</div>
</div>

<AuthToast message={toastMessage} kind={toastKind} />
