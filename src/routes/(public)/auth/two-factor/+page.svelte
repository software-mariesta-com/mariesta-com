<script lang="ts">
	import { enhance } from '$app/forms';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let totpPending = $state(false);
	let backupPending = $state(false);

	const toastMessage = $derived(form?.message ?? null);
</script>

<svelte:head>
	<title>Two-factor verification | MARIESTA</title>
	<meta name="description" content="Verify your MARIESTA sign-in with a two-factor code." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="card bg-base-100 card-border shadow-sm">
	<div class="card-body gap-5">
		<h1 class="card-title text-primary font-bold">Two-factor verification</h1>

		<form
			method="POST"
			action="?/verifyTotp"
			class="grid gap-4"
			use:enhance={withFormPending((v) => (totpPending = v))}
		>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Authenticator code<span
						class="text-error align-top text-sm leading-none"
						aria-hidden="true">*</span
					>
				</legend>
				<input
					id="totp-code"
					class="input w-full cursor-text tracking-widest"
					name="code"
					inputmode="numeric"
					autocomplete="one-time-code"
					required
					disabled={totpPending || backupPending}
				/>
			</fieldset>

			<LoadingButton busy={totpPending} class="btn btn-primary" disabled={backupPending}>
				<ShieldCheck class="h-4 w-4" aria-hidden="true" />
				Verify
			</LoadingButton>
		</form>

		<div class="divider text-xs">or use a backup code</div>

		<form
			method="POST"
			action="?/verifyBackup"
			class="grid gap-4"
			use:enhance={withFormPending((v) => (backupPending = v))}
		>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Backup code<span class="text-error align-top text-sm leading-none" aria-hidden="true"
						>*</span
					>
				</legend>
				<input
					id="backup-code"
					class="input w-full cursor-text"
					name="code"
					required
					disabled={backupPending || totpPending}
				/>
			</fieldset>

			<LoadingButton busy={backupPending} class="btn btn-outline" disabled={totpPending}>
				Verify backup code
			</LoadingButton>
		</form>

		<div class="text-sm">
			<a class="link link-hover cursor-pointer" href={AUTH_ROUTES.login}>Back to login</a>
		</div>
	</div>
</div>

<AuthToast message={toastMessage} kind="error" />
