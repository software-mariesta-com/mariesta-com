<script lang="ts">
	import { enhance } from '$app/forms';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ShieldOff from '@lucide/svelte/icons/shield-off';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import OtpCodeField from '#lib/components/OtpCodeField.svelte';
	import PasswordField from '#lib/components/PasswordField.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let disablePending = $state(false);
	let verifyPending = $state(false);
	let enablePending = $state(false);
	let logoutPending = $state(false);

	const toastMessage = $derived(form?.message ?? form?.success ?? null);
	const toastKind = $derived<'success' | 'error'>(form?.success ? 'success' : 'error');
	const totpURI = $derived(form && 'totpURI' in form ? form.totpURI : null);
	const backupCodes = $derived(form && 'backupCodes' in form ? form.backupCodes : null);
	const setupPending = $derived(Boolean(totpURI));
</script>

<svelte:head>
	<title>Profile | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold text-base-content sm:text-3xl">Profile</h1>
	</div>

	<section class="rounded-box border border-base-300 bg-base-100 p-5">
		<h2 class="card-title text-secondary font-bold">Account</h2>
		<dl class="mt-3 grid gap-2 text-sm">
			<div class="flex justify-between gap-4 border-b border-base-300 py-2">
				<dt class="text-base-content/60">Name</dt>
				<dd class="font-medium">{data.user.name}</dd>
			</div>
			<div class="flex justify-between gap-4 py-2">
				<dt class="text-base-content/60">Email</dt>
				<dd class="font-medium">{data.user.email}</dd>
			</div>
		</dl>
	</section>

	<section class="rounded-box border border-base-300 bg-base-100 p-5">
		<h2 class="card-title text-secondary font-bold">Two-factor authentication</h2>

		{#if data.twoFactorEnabled && !setupPending}
			<p class="mt-2 text-sm text-success">2FA is enabled on your account.</p>
			<form
				method="POST"
				action="?/disable2fa"
				class="mt-4 grid gap-4"
				use:enhance={withFormPending((v) => (disablePending = v))}
			>
				<PasswordField
					id="disable-2fa-password"
					name="password"
					label="Password"
					autocomplete="current-password"
					revealable={false}
				/>
				<LoadingButton busy={disablePending} class="btn btn-outline btn-error">
					<ShieldOff class="h-5 w-5" aria-hidden="true" />
					Turn off 2FA
				</LoadingButton>
			</form>
		{:else if setupPending && totpURI}
			<p class="mt-2 text-sm text-base-content/70">
				Scan this QR code in your authenticator app, save your backup codes, then verify.
			</p>
			<div class="mt-4 flex justify-center">
				<img
					src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpURI)}`}
					alt="Two-factor authentication QR code"
					width="200"
					height="200"
					class="rounded-box bg-base-100"
				/>
			</div>
			{#if backupCodes?.length}
				<div class="mt-4">
					<p class="text-sm font-medium">Backup codes</p>
					<ul class="mt-2 grid gap-1 font-mono text-xs sm:grid-cols-2">
						{#each backupCodes as code (code)}
							<li class="rounded-field bg-base-200 px-2 py-1">{code}</li>
						{/each}
					</ul>
				</div>
			{/if}
			<form
				method="POST"
				action="?/verify2fa"
				class="mt-4 grid gap-4"
				use:enhance={withFormPending((v) => (verifyPending = v))}
			>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">
						Authenticator code<span
							class="text-error align-top text-sm leading-none"
							aria-hidden="true">*</span
						>
					</legend>
					<OtpCodeField id="verify-2fa-code" name="code" />
				</fieldset>
				<LoadingButton busy={verifyPending} class="btn btn-primary">
					<ShieldCheck class="h-5 w-5" aria-hidden="true" />
					Confirm 2FA
				</LoadingButton>
			</form>
		{:else}
			<p class="mt-2 text-sm text-base-content/70">
				Add an authenticator app for a second step when you sign in.
			</p>
			<form
				method="POST"
				action="?/enable2fa"
				class="mt-4 grid gap-4"
				use:enhance={withFormPending((v) => (enablePending = v))}
			>
				<PasswordField
					id="enable-2fa-password"
					name="password"
					label="Password"
					autocomplete="current-password"
					revealable={false}
				/>
				<LoadingButton busy={enablePending} class="btn btn-outline">
					<ShieldCheck class="h-5 w-5" aria-hidden="true" />
					Set up 2FA
				</LoadingButton>
			</form>
		{/if}
	</section>

	<section class="rounded-box border border-base-300 bg-base-100 p-5">
		<h2 class="card-title text-error font-bold">Session</h2>
		<div class="mt-4 grid gap-3">
			<a
				href={AUTH_ROUTES.forgotPassword}
				class="btn btn-outline btn-block cursor-pointer"
			>
				<KeyRound class="h-5 w-5" aria-hidden="true" />
				Forgot password
			</a>
			<form
				method="POST"
				action={AUTH_ROUTES.logout}
				onsubmit={() => {
					if (logoutPending) return;
					logoutPending = true;
				}}
			>
				<LoadingButton busy={logoutPending} class="btn btn-error btn-block">
					<LogOut class="h-5 w-5" aria-hidden="true" />
					Logout
				</LoadingButton>
			</form>
		</div>
	</section>
</div>

<AuthToast message={toastMessage} kind={toastKind} />
