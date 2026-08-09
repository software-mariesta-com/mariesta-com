<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import PasswordField from '#lib/components/PasswordField.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let emailPending = $state(false);
	let socialPending = $state(false);

	const toastMessage = $derived(
		form?.message ??
			(page.url.searchParams.get('reset') === '1'
				? 'Password updated. You can sign in now.'
				: null)
	);
	const toastKind = $derived<'success' | 'error'>(form?.message ? 'error' : 'success');
</script>

<svelte:head>
	<title>Login | MARIESTA</title>
	<meta name="description" content="Sign in to your MARIESTA account." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="card bg-base-100 card-border shadow-sm">
	<div class="card-body gap-5">
		<h1 class="card-title text-primary font-bold">Login</h1>

		<form
			method="POST"
			action="?/signInEmail"
			class="grid gap-4"
			use:enhance={withFormPending((v) => (emailPending = v))}
		>
			<input type="hidden" name="redirectTo" value={data.redirectTo} />

			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Email<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
				</legend>
				<input
					id="login-email"
					class="input w-full cursor-text"
					name="email"
					type="email"
					autocomplete="email"
					required
					disabled={emailPending || socialPending}
				/>
			</fieldset>

			<PasswordField
				id="login-password"
				name="password"
				label="Password"
				autocomplete="current-password"
			/>

			<LoadingButton
				busy={emailPending}
				class="btn btn-primary"
				disabled={socialPending}
			>
				Continue
			</LoadingButton>
		</form>

		{#if data.githubEnabled}
			<div class="divider text-xs">or</div>

			<form
				method="POST"
				action="?/signInSocial"
				use:enhance={withFormPending((v) => (socialPending = v))}
			>
				<input type="hidden" name="provider" value="github" />
				<input type="hidden" name="callbackURL" value={data.redirectTo} />
				<LoadingButton
					busy={socialPending}
					class="btn btn-outline btn-block"
					disabled={emailPending}
				>
					<SiGithub class="h-4 w-4" aria-hidden="true" />
					Continue with GitHub
				</LoadingButton>
			</form>
		{/if}

		<div class="flex flex-wrap items-center justify-end gap-2 text-sm">
			<a class="link link-hover cursor-pointer" href={AUTH_ROUTES.forgotPassword}>Forgot password?</a>
		</div>
	</div>
</div>

<AuthToast message={toastMessage} kind={toastKind} />
