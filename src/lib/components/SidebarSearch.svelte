<script lang="ts">
	import { goto } from '$app/navigation';
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import type { Component } from 'svelte';
	import { tick } from 'svelte';

	export type SidebarSearchItem = {
		href: string;
		label: string;
		icon: Component;
	};

	let {
		items,
		open = $bindable(false)
	}: {
		items: SidebarSearchItem[];
		open?: boolean;
	} = $props();

	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let dialogEl = $state<HTMLDialogElement | null>(null);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter(
			(item) =>
				item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
		);
	});

	const activeIndex = $derived(
		filtered.length === 0 ? 0 : Math.min(selectedIndex, filtered.length - 1)
	);

	// Keep the native <dialog> top-layer in sync with bindable `open`.
	// showModal() places the overlay above drawer/sidebar stacking contexts.
	$effect(() => {
		const el = dialogEl;
		if (!el) return;

		if (open) {
			if (!el.open) el.showModal();
			void tick().then(() => {
				if (!open) return;
				inputEl?.focus();
				inputEl?.select();
			});
		} else if (el.open) {
			el.close();
		}
	});

	function closeSearch() {
		open = false;
		query = '';
		selectedIndex = 0;
	}

	function closeMobileDrawer() {
		const drawer = document.getElementById('admin-drawer');
		if (drawer instanceof HTMLInputElement) drawer.checked = false;
	}

	async function navigateTo(href: string) {
		closeSearch();
		closeMobileDrawer();
		await goto(href);
	}

	function onQueryInput(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;
		query = target.value;
		selectedIndex = 0;
	}

	function highlightParts(text: string, q: string): { text: string; match: boolean }[] {
		const trimmed = q.trim();
		if (!trimmed) return [{ text, match: false }];
		const lower = text.toLowerCase();
		const needle = trimmed.toLowerCase();
		const parts: { text: string; match: boolean }[] = [];
		let i = 0;
		while (i < text.length) {
			const idx = lower.indexOf(needle, i);
			if (idx === -1) {
				parts.push({ text: text.slice(i), match: false });
				break;
			}
			if (idx > i) parts.push({ text: text.slice(i, idx), match: false });
			parts.push({ text: text.slice(idx, idx + needle.length), match: true });
			i = idx + needle.length;
		}
		return parts;
	}

	function onGlobalKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			open = !open;
			return;
		}

		if (!open) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (filtered.length === 0) return;
			selectedIndex = (activeIndex + 1) % filtered.length;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (filtered.length === 0) return;
			selectedIndex = (activeIndex - 1 + filtered.length) % filtered.length;
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			const item = filtered[activeIndex];
			if (item) void navigateTo(item.href);
		}
	}

	function onDialogClose() {
		open = false;
		query = '';
		selectedIndex = 0;
	}
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<!-- Mounted at layout root (outside drawer/aside) so the overlay covers the viewport -->
<dialog
	bind:this={dialogEl}
	class="modal modal-bottom sm:modal-middle z-[100]"
	aria-label="Search pages"
	onclose={onDialogClose}
	oncancel={(event) => {
		event.preventDefault();
		closeSearch();
	}}
>
	<div class="modal-box flex max-h-[min(32rem,85svh)] w-full max-w-lg flex-col gap-3 p-4 sm:p-6">
		<div class="flex items-start justify-between gap-2">
			<h2 class="card-title text-primary font-bold">Search pages</h2>
			<div class="tooltip tooltip-left" data-tip="Close">
				<button
					type="button"
					class="btn btn-ghost btn-square btn-sm cursor-pointer"
					aria-label="Close"
					onclick={closeSearch}
				>
					<X class="h-4 w-4" aria-hidden="true" />
				</button>
			</div>
		</div>

		<label class="input input-bordered flex w-full items-center gap-2">
			<Search class="text-base-content/50 h-4 w-4 shrink-0" aria-hidden="true" />
			<input
				bind:this={inputEl}
				value={query}
				oninput={onQueryInput}
				type="search"
				class="grow cursor-text"
				placeholder="Search pages…"
				aria-label="Search pages"
				autocomplete="off"
				autocorrect="off"
				spellcheck="false"
			/>
		</label>

		<ul class="menu bg-base-200 rounded-box min-h-0 flex-1 overflow-y-auto p-1" role="listbox">
			{#if filtered.length === 0}
				<li class="disabled">
					<span class="text-base-content/60">No matching pages</span>
				</li>
			{:else}
				{#each filtered as item, index (item.href)}
					<li role="option" aria-selected={index === activeIndex}>
						<button
							type="button"
							class={['cursor-pointer', index === activeIndex && 'bg-primary/20']}
							onclick={() => void navigateTo(item.href)}
							onmouseenter={() => (selectedIndex = index)}
						>
							<item.icon class="h-4 w-4 shrink-0" aria-hidden="true" />
							<span class="min-w-0 flex-1 truncate text-left">
								{#each highlightParts(item.label, query) as part, partIndex (`${item.href}-${partIndex}-${part.text}`)}
									{#if part.match}
										<mark class="bg-warning/50 text-inherit rounded-sm px-0.5">{part.text}</mark>
									{:else}
										{part.text}
									{/if}
								{/each}
							</span>
						</button>
					</li>
				{/each}
			{/if}
		</ul>

		<p class="text-base-content/50 text-xs">
			↑↓ to move · Enter to open · Esc to close
		</p>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="submit" class="cursor-pointer">close</button>
	</form>
</dialog>
