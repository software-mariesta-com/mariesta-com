<script lang="ts">
	import { enhance } from '$app/forms';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import OtpCodeField from '#lib/components/OtpCodeField.svelte';
	import OtpResendControls from '#lib/components/OtpResendControls.svelte';
	import PasswordField from '#lib/components/PasswordField.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let pending = $state(false);

	const token = $derived(
		form && 'token' in form && form.token ? form.token : data.token
	);
	const useToken = $derived(Boolean(token) || form?.mode === 'token' || Boolean(data.token));
	const email = $derived(form && 'email' in form ? (form.email ?? data.email) : data.email);
	const toastMessage = $derived(
		form?.message ?? form?.success ?? data.tokenError ?? null
	);
	const toastKind = $derived<'success' | 'error'>(form?.success ? 'success' : 'error');
</script>

<svelte:head>
	<title>Reset password | MARIESTA</title>
	<meta name="description" content="Choose a new MARIESTA password." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="card bg-base-100 card-border shadow-sm">
	<div class="card-body gap-5">
		<h1 class="card-title text-secondary font-bold">
			{useToken ? 'Set password' : 'Reset password'}
		</h1>

		{#if useToken}
			<form
				method="POST"
				action="?/resetWithToken"
				class="grid gap-4"
				use:enhance={withFormPending((v) => (pending = v))}
			>
				<input type="hidden" name="token" value={token} />

				<PasswordField
					id="reset-password"
					name="newPassword"
					label="New password"
					autocomplete="new-password"
					minlength={8}
				/>

				<PasswordField
					id="reset-password-confirm"
					name="newPasswordConfirm"
					label="Confirm new password"
					autocomplete="new-password"
					minlength={8}
				/>

				<LoadingButton busy={pending} class="btn btn-primary">
					<KeyRound class="h-4 w-4" aria-hidden="true" />
					Set password
				</LoadingButton>
			</form>
		{:else}
			<form
				method="POST"
				action="?/reset"
				class="grid gap-4"
				use:enhance={withFormPending((v) => (pending = v))}
			>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">
						Email<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</legend>
					<input
						id="reset-email"
						class="input w-full cursor-text"
						name="email"
						type="email"
						autocomplete="email"
						value={email}
						required
						disabled={pending}
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">
						Code<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</legend>
					<OtpCodeField id="reset-otp" name="otp" />
				</fieldset>

				<PasswordField
					id="reset-password-otp"
					name="newPassword"
					label="New password"
					autocomplete="new-password"
					minlength={8}
				/>

				<PasswordField
					id="reset-password-otp-confirm"
					name="newPasswordConfirm"
					label="Confirm new password"
					autocomplete="new-password"
					minlength={8}
				/>

				<LoadingButton busy={pending} class="btn btn-primary">
					<KeyRound class="h-4 w-4" aria-hidden="true" />
					Set new password
				</LoadingButton>
			</form>

			<OtpResendControls email={email} />
		{/if}

		<div class="text-sm">
			<a class="link link-hover cursor-pointer" href={AUTH_ROUTES.login}>Back to login</a>
		</div>
	</div>
</div>

<AuthToast message={toastMessage} kind={toastKind} />
