<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import {
		OTP_EXPIRES_IN_SEC,
		OTP_RESEND_COOLDOWN_SEC,
		formatCountdown
	} from '#lib/constants/otp';

	let {
		email,
		action = '?/resend'
	}: {
		email: string;
		action?: string;
	} = $props();

	let now = $state(Date.now());
	let expireAt = $state(Date.now() + OTP_EXPIRES_IN_SEC * 1000);
	let resendAt = $state(Date.now() + OTP_RESEND_COOLDOWN_SEC * 1000);
	let pending = $state(false);

	const expiresIn = $derived(Math.max(0, Math.ceil((expireAt - now) / 1000)));
	const resendIn = $derived(Math.max(0, Math.ceil((resendAt - now) / 1000)));
	const expired = $derived(expiresIn <= 0);
	const resendBlocked = $derived(!expired && resendIn > 0);
	const canResend = $derived(Boolean(email) && !resendBlocked && !pending);

	onMount(() => {
		const id = setInterval(() => {
			now = Date.now();
		}, 250);
		return () => clearInterval(id);
	});

	function resetTimers() {
		const t = Date.now();
		now = t;
		expireAt = t + OTP_EXPIRES_IN_SEC * 1000;
		resendAt = t + OTP_RESEND_COOLDOWN_SEC * 1000;
	}
</script>

<div class="grid gap-2 text-center text-sm text-base-content/70">
	{#if expired}
		<p class="text-error">This code has expired. Request a new one.</p>
	{:else}
		<p>Code expires in {formatCountdown(expiresIn)}</p>
	{/if}

	<form
		method="POST"
		{action}
		class="grid gap-2"
		use:enhance={() => {
			pending = true;
			return async ({ result, update }) => {
				try {
					await update();
					if (result.type === 'success') resetTimers();
				} finally {
					pending = false;
				}
			};
		}}
	>
		<input type="hidden" name="email" value={email} />
		<LoadingButton
			busy={pending}
			class="btn btn-ghost btn-sm"
			disabled={!canResend && !pending}
		>
			{#if pending}
				Sending…
			{:else if resendBlocked}
				Resend in {formatCountdown(resendIn)}
			{:else}
				Resend code
			{/if}
		</LoadingButton>
	</form>
</div>
