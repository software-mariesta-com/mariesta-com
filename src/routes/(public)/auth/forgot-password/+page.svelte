<script lang="ts">
	import { enhance } from '$app/forms';
	import Mail from '@lucide/svelte/icons/mail';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let pending = $state(false);

	const toastMessage = $derived(form?.message ?? null);
	const toastKind = $derived<'success' | 'error'>('error');
</script>

<svelte:head>
	<title>Forgot password | MARIESTA</title>
	<meta name="description" content="Request a MARIESTA password reset link." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="card bg-base-100 card-border shadow-sm">
	<div class="card-body gap-5">
		<h1 class="card-title text-secondary font-bold">Forgot password</h1>

		<form
			method="POST"
			action="?/requestReset"
			class="grid gap-4"
			use:enhance={withFormPending((v) => (pending = v))}
		>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">
					Email<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
				</legend>
				<input
					id="forgot-email"
					class="input w-full cursor-text"
					name="email"
					type="email"
					autocomplete="email"
					required
					disabled={pending}
				/>
			</fieldset>

			<LoadingButton busy={pending} class="btn btn-primary">
				<Mail class="h-4 w-4" aria-hidden="true" />
				Send reset link
			</LoadingButton>
		</form>

		<div class="text-sm">
			<a class="link link-hover cursor-pointer" href={AUTH_ROUTES.login}>Back to login</a>
		</div>
	</div>
</div>

<AuthToast message={toastMessage} kind={toastKind} />
