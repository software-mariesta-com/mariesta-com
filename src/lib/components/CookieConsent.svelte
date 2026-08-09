<script lang="ts">
	import { onMount } from 'svelte';
	import Cookie from '@lucide/svelte/icons/cookie';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import X from '@lucide/svelte/icons/x';
	import { localizeHref } from '#lib/paraglide/runtime';
	import {
		acceptAllConsent,
		consumeOpenCookieSettingsRequest,
		hasConsentRecord,
		readConsent,
		rejectNonEssentialConsent,
		saveConsent,
		subscribeConsent
	} from '#lib/store/local-storage/cookie-consent';

	let visible = $state(false);
	let customizeOpen = $state(false);
	let preferences = $state(false);
	let analytics = $state(false);
	let hasRecord = $state(false);

	function syncFromStore() {
		const consent = readConsent();
		hasRecord = consent !== null;
		if (consent) {
			preferences = consent.preferences;
			analytics = consent.analytics;
		} else {
			preferences = false;
			analytics = false;
		}
	}

	function showBanner() {
		visible = true;
		customizeOpen = false;
		syncFromStore();
	}

	function showCustomize() {
		visible = true;
		customizeOpen = true;
		syncFromStore();
	}

	function hide() {
		visible = false;
		customizeOpen = false;
	}

	function onAcceptAll() {
		acceptAllConsent();
		hide();
	}

	function onReject() {
		rejectNonEssentialConsent();
		hide();
	}

	function onSaveCustomize() {
		saveConsent({ preferences, analytics });
		hide();
	}

	onMount(() => {
		syncFromStore();
		if (!hasConsentRecord()) {
			showBanner();
		}
		return subscribeConsent(() => {
			syncFromStore();
			if (consumeOpenCookieSettingsRequest()) {
				showCustomize();
			}
		});
	});
</script>

{#if visible}
	<div
		class="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-3 sm:p-4"
		role="dialog"
		aria-modal="false"
		aria-labelledby="cookie-consent-title"
	>
		<div
			class="border-base-300 bg-base-100 pointer-events-auto card card-border w-full max-w-2xl shadow-lg"
		>
			<div class="card-body gap-4 p-4 sm:p-5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex min-w-0 items-start gap-3">
						<span
							class="bg-primary/10 text-primary mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-box"
							aria-hidden="true"
						>
							<Cookie class="h-5 w-5" />
						</span>
						<div class="min-w-0">
							<h2 id="cookie-consent-title" class="text-base-content text-lg font-bold">
								Cookie preferences
							</h2>
							<p class="text-base-content/70 mt-1 text-sm leading-relaxed">
								We use essential cookies for sign-in security. Preferences (theme and language)
								and analytics need your choice.
								<a
									href={localizeHref('/cookie-policy')}
									class="link link-primary cursor-pointer ms-1"
									>Cookie policy</a
								>
							</p>
						</div>
					</div>
					{#if hasRecord}
						<button
							type="button"
							class="btn btn-ghost btn-square btn-sm cursor-pointer"
							aria-label="Close"
							onclick={hide}
						>
							<X class="h-4 w-4" aria-hidden="true" />
						</button>
					{/if}
				</div>

				{#if customizeOpen}
					<ul class="border-base-300 divide-base-300 divide-y rounded-box border">
						<li class="flex items-center justify-between gap-3 px-3 py-3">
							<div>
								<p class="text-base-content text-sm font-semibold">Essential</p>
								<p class="text-base-content/60 text-xs">
									Sign-in and security. Always on.
								</p>
							</div>
							<input
								type="checkbox"
								class="toggle toggle-primary cursor-not-allowed"
								checked
								disabled
								aria-label="Essential cookies always on"
							/>
						</li>
						<li class="flex items-center justify-between gap-3 px-3 py-3">
							<div>
								<p class="text-base-content text-sm font-semibold">Preferences</p>
								<p class="text-base-content/60 text-xs">
									Remember theme and language across visits.
								</p>
							</div>
							<input
								type="checkbox"
								class="toggle toggle-secondary cursor-pointer"
								bind:checked={preferences}
								aria-label="Allow preference cookies"
							/>
						</li>
						<li class="flex items-center justify-between gap-3 px-3 py-3">
							<div>
								<p class="text-base-content text-sm font-semibold">Analytics</p>
								<p class="text-base-content/60 text-xs">
									Optional usage measurement. None loaded unless you allow this.
								</p>
							</div>
							<input
								type="checkbox"
								class="toggle toggle-secondary cursor-pointer"
								bind:checked={analytics}
								aria-label="Allow analytics cookies"
							/>
						</li>
					</ul>
					<div class="flex flex-wrap justify-end gap-2">
						<button
							type="button"
							class="btn btn-ghost btn-sm cursor-pointer"
							onclick={() => (customizeOpen = false)}
						>
							Back
						</button>
						<button
							type="button"
							class="btn btn-primary btn-sm cursor-pointer"
							onclick={onSaveCustomize}
						>
							Save choices
						</button>
					</div>
				{:else}
					<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
						<button
							type="button"
							class="btn btn-ghost btn-sm cursor-pointer"
							onclick={() => (customizeOpen = true)}
						>
							<Settings2 class="h-4 w-4" aria-hidden="true" />
							Customize
						</button>
						<button
							type="button"
							class="btn btn-outline btn-sm cursor-pointer"
							onclick={onReject}
						>
							Reject non-essential
						</button>
						<button
							type="button"
							class="btn btn-primary btn-sm cursor-pointer"
							onclick={onAcceptAll}
						>
							Accept all
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
