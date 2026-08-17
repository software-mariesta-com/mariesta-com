<script lang="ts">
	import { onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ShieldOff from '@lucide/svelte/icons/shield-off';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AuthToast from '#lib/components/AuthToast.svelte';
	import CrudToast, { type CrudToastKind } from '#lib/components/CrudToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import ProfileAvatar from '#lib/components/ProfileAvatar.svelte';
	import OtpCodeField from '#lib/components/OtpCodeField.svelte';
	import PasswordField from '#lib/components/PasswordField.svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import {
		purchasePlanStatusBadgeClass,
		purchasePlanStatusLabel
	} from '#lib/constants/purchase-plans';
	import { withFormPending } from '#lib/util/form-pending';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let disablePending = $state(false);
	let verifyPending = $state(false);
	let enablePending = $state(false);
	let logoutPending = $state(false);

	let previewUrl = $state<string | null>(null);
	let confirmedAvatarUrl = $state<string | null>(null);
	let uploading = $state(false);
	let removing = $state(false);
	let avatarToastMessage = $state<string | null>(null);
	let avatarToastKind = $state<CrudToastKind>('success');
	let avatarToastTimer: ReturnType<typeof setTimeout> | null = null;

	let devModeOptimistic = $state<boolean | null>(null);
	let devModePending = $state(false);
	let devModeToastMessage = $state<string | null>(null);
	let devModeToastKind = $state<CrudToastKind>('success');
	let devModeToastTimer: ReturnType<typeof setTimeout> | null = null;

	const developerMode = $derived(devModeOptimistic ?? data.developerMode);

	const authToastMessage = $derived(form?.message ?? form?.success ?? null);
	const authToastKind = $derived<'success' | 'error'>(form?.success ? 'success' : 'error');
	const totpURI = $derived(form && 'totpURI' in form ? form.totpURI : null);
	const backupCodes = $derived(form && 'backupCodes' in form ? form.backupCodes : null);
	const setupPending = $derived(Boolean(totpURI));
	const avatarUrl = $derived(data.user.imageUrl ?? null);
	const displayAvatarUrl = $derived(previewUrl ?? confirmedAvatarUrl ?? avatarUrl);
	const initials = $derived(
		data.user.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('') || '?'
	);
	const avatarBusy = $derived(uploading || removing);
	const canChangeAvatar = $derived(data.twoFactorEnabled);
	const canUseDeveloperModeToggle = $derived(
		data.twoFactorEnabled && (data.canEnableDeveloperMode || developerMode)
	);
	const developerModeDisabledReason = $derived.by(() => {
		if (canUseDeveloperModeToggle) return null;
		const needs2fa = !data.twoFactorEnabled;
		const needsPaid = data.isFreeTier;
		if (needs2fa && needsPaid) return 'Requires two-factor authentication and a paid tier.';
		if (needs2fa) return 'Requires two-factor authentication.';
		if (needsPaid) return 'Requires a paid tier. Upgrade your plan to enable developer mode.';
		return null;
	});

	function showDevModeToast(message: string, kind: CrudToastKind = 'success') {
		devModeToastMessage = message;
		devModeToastKind = kind;
		if (devModeToastTimer) clearTimeout(devModeToastTimer);
		devModeToastTimer = setTimeout(() => {
			devModeToastMessage = null;
		}, 3500);
	}

	async function onDeveloperModeChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const next = input.checked;
		if (devModePending) {
			input.checked = developerMode;
			return;
		}
		if (!canUseDeveloperModeToggle) {
			input.checked = developerMode;
			return;
		}
		if (next && !data.canEnableDeveloperMode) {
			input.checked = developerMode;
			showDevModeToast('Requires two-factor authentication and a paid tier.', 'error');
			return;
		}

		const previous = developerMode;
		devModeOptimistic = next;
		devModePending = true;

		try {
			const res = await fetch('/api/profile/developer-mode', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ developerMode: next })
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Could not update developer mode');
			}
			const payload = (await res.json()) as { developerMode: boolean };
			showDevModeToast(
				payload.developerMode ? 'Developer mode enabled.' : 'Developer mode disabled.'
			);
			devModeOptimistic = null;
			await invalidateAll();
		} catch (err) {
			devModeOptimistic = null;
			input.checked = previous;
			showDevModeToast(
				err instanceof Error ? err.message : 'Could not update developer mode',
				'error'
			);
		} finally {
			devModePending = false;
		}
	}

	function showAvatarToast(message: string, kind: CrudToastKind = 'success') {
		avatarToastMessage = message;
		avatarToastKind = kind;
		if (avatarToastTimer) clearTimeout(avatarToastTimer);
		avatarToastTimer = setTimeout(() => {
			avatarToastMessage = null;
		}, 3500);
	}

	function clearPreview() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
	}

	onDestroy(() => {
		if (avatarToastTimer) clearTimeout(avatarToastTimer);
		if (devModeToastTimer) clearTimeout(devModeToastTimer);
		clearPreview();
	});

	async function onAvatarChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!canChangeAvatar) {
			showAvatarToast('Enable two-factor authentication before changing your photo.', 'error');
			input.value = '';
			return;
		}

		clearPreview();
		previewUrl = URL.createObjectURL(file);
		uploading = true;

		try {
			const body = new FormData();
			body.set('file', file);
			const res = await fetch('/api/profile/avatar', { method: 'POST', body });
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Upload failed');
			}
			const updated = (await res.json()) as { imageUrl?: string | null };
			clearPreview();
			confirmedAvatarUrl = updated.imageUrl ?? null;
			showAvatarToast('Profile photo updated.');
			await invalidateAll();
			confirmedAvatarUrl = null;
		} catch (err) {
			clearPreview();
			showAvatarToast(err instanceof Error ? err.message : 'Upload failed', 'error');
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	async function removeAvatar() {
		if (!avatarUrl || avatarBusy) return;
		if (!canChangeAvatar) {
			showAvatarToast('Enable two-factor authentication before changing your photo.', 'error');
			return;
		}

		removing = true;
		try {
			const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Could not remove photo');
			}
			clearPreview();
			confirmedAvatarUrl = null;
			showAvatarToast('Profile photo removed.');
			await invalidateAll();
		} catch (err) {
			showAvatarToast(err instanceof Error ? err.message : 'Could not remove photo', 'error');
		} finally {
			removing = false;
		}
	}
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
		<h2 class="card-title text-primary font-bold">Avatar</h2>
		<div class="mt-4 flex flex-col items-center gap-4">
			<ProfileAvatar src={displayAvatarUrl} {initials} alt="" />
			<div class="flex w-full min-w-0 flex-col gap-3">
				{#if !canChangeAvatar}
					<p class="text-sm text-warning">
						Enable two-factor authentication below before uploading or removing your photo.
					</p>
				{/if}
				<label class="form-control w-full" for="profile-avatar">
					<span class="label-text mb-1">Upload photo</span>
					<input
						id="profile-avatar"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						class="file-input file-input-bordered w-full cursor-pointer"
						onchange={onAvatarChange}
						disabled={avatarBusy || !canChangeAvatar}
					/>
				</label>
				<p class="text-base-content/60 text-xs">JPEG, PNG, WebP, or GIF. Max 5 MB.</p>
				{#if uploading}
					<p class="text-base-content/60 text-sm">Uploading...</p>
				{/if}
				{#if avatarUrl}
					<button
						type="button"
						class="btn btn-outline btn-error w-full cursor-pointer sm:w-auto"
						onclick={removeAvatar}
						disabled={avatarBusy || !canChangeAvatar}
					>
						<Trash2 class="h-5 w-5" aria-hidden="true" />
						Remove photo
					</button>
				{/if}
			</div>
		</div>
	</section>

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
		<h2 class="card-title text-secondary font-bold">Current tier</h2>
		<div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="min-w-0">
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-lg font-semibold text-base-content">{data.tierLabel.name}</span>
					<span class="badge badge-primary badge-outline">{data.tierLabel.badge}</span>
				</div>
				<p class="mt-1 text-sm text-base-content/60">Your active subscription tier.</p>
			</div>
			<a
				href={data.tierChangeUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-outline btn-primary w-full cursor-pointer sm:w-auto"
			>
				<ExternalLink class="h-5 w-5" aria-hidden="true" />
				Change tier
			</a>
		</div>
	</section>

	<section class="rounded-box border border-base-300 bg-base-100 p-5">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div class="min-w-0">
				<h2 class="card-title text-secondary font-bold">Purchase plan</h2>
				<p class="mt-1 text-sm text-base-content/60">
					Software plans linked to your account, usually purchased on Menzies.
				</p>
			</div>
			<a
				href={data.browsePlansUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-outline btn-secondary w-full shrink-0 cursor-pointer sm:w-auto"
			>
				<ShoppingBag class="h-5 w-5" aria-hidden="true" />
				Browse plan
			</a>
		</div>

		{#if data.purchasePlans.length === 0}
			<p class="mt-4 text-sm text-base-content/60">No purchased plans yet.</p>
		{:else}
			<ul
				class="mt-4 max-h-48 divide-y divide-base-300 overflow-y-auto rounded-box border border-base-300"
				aria-label="Purchased plans"
			>
				{#each data.purchasePlans as plan (plan.id)}
					<li class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="min-w-0">
							<p class="font-medium text-base-content">{plan.name}</p>
							<p class="text-sm text-base-content/60">
								{plan.source} · Purchased {plan.purchasedAt}
							</p>
						</div>
						<span class="badge shrink-0 {purchasePlanStatusBadgeClass(plan.status)}">
							{purchasePlanStatusLabel(plan.status)}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
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
		<h2 class="card-title text-secondary font-bold">Developer mode</h2>
		<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div class="min-w-0 flex-1">
				<p class="text-sm text-base-content/70">
					Unlock developer tools and advanced options for your account.
				</p>
				{#if developerModeDisabledReason}
					<p class="mt-2 text-sm text-warning">{developerModeDisabledReason}</p>
				{:else if developerMode}
					<p class="mt-2 text-sm text-success">Developer mode is on.</p>
				{/if}
			</div>
			<label
				class="label cursor-default justify-start gap-3 sm:justify-end"
				class:cursor-pointer={canUseDeveloperModeToggle && !devModePending}
				class:cursor-not-allowed={!canUseDeveloperModeToggle || devModePending}
			>
				<span class="label-text text-sm">Enable</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					class:cursor-pointer={canUseDeveloperModeToggle && !devModePending}
					class:cursor-not-allowed={!canUseDeveloperModeToggle || devModePending}
					checked={developerMode}
					disabled={!canUseDeveloperModeToggle || devModePending}
					onchange={onDeveloperModeChange}
					aria-label="Developer mode"
				/>
			</label>
		</div>
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

<AuthToast message={authToastMessage} kind={authToastKind} />
<CrudToast message={avatarToastMessage} kind={avatarToastKind} />
<CrudToast message={devModeToastMessage} kind={devModeToastKind} />
