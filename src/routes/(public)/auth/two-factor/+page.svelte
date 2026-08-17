<script lang="ts">
	import { enhance } from '$app/forms';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import OtpCodeField from '#lib/components/OtpCodeField.svelte';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

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
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Authenticator code<span
						class="text-error align-top text-sm leading-none"
						aria-hidden="true">*</span
					>
				</legend>
				<OtpCodeField
					id="totp-code"
					name="code"
					label="Authenticator code"
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
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
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
	</div>
</div>

<AuthToast message={toastMessage} kind="error" />
