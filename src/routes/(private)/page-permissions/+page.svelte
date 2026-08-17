<script lang="ts">
	import { onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CrudToast, { type CrudToastKind } from '#lib/components/CrudToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import {
		PERMISSION_ACTIONS,
		PERMISSION_SECTION_LABELS,
		PERMISSION_SECTIONS,
		type PermissionAction,
		type PermissionSection
	} from '#lib/constants/permissions';
	import { formatShortDateTime } from '#lib/util/format-datetime';
	import type { PageData } from './$types';

	type PagePermissionRow = {
		id: string;
		slug: string;
		name: string;
		routePattern: string;
		section: PermissionSection;
		action: PermissionAction;
		description: string | null;
		sortOrder: number;
		createdAt: string;
		updatedAt: string;
	};

	let { data }: { data: PageData } = $props();

	let items = $derived(data.items as PagePermissionRow[]);
	let loading = $state(false);
	let loadError = $derived(data.loadError);

	let nameFilter = $state('');
	let sectionFilter = $state('');
	let actionFilter = $state('');
	let routeFilter = $state('');
	let page = $state(1);
	let pageSize = $state(8);
	let bodyEl = $state<HTMLDivElement | null>(null);

	let dialogOpen = $state(false);
	let editing = $state<PagePermissionRow | null>(null);
	let formSlug = $state('');
	let formName = $state('');
	let formRoutePattern = $state('');
	let formSection = $state<PermissionSection>('dashboard');
	let formAction = $state<PermissionAction>('view');
	let formDescription = $state('');
	let saving = $state(false);

	let deleteTarget = $state<PagePermissionRow | null>(null);
	let deleting = $state(false);

	let toastMessage = $state<string | null>(null);
	let toastKind = $state<CrudToastKind>('success');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const ROW_HEIGHT = 48;

	const filtered = $derived(
		items.filter((item) => {
			const q = nameFilter.toLowerCase();
			if (q && !item.name.toLowerCase().includes(q) && !item.slug.toLowerCase().includes(q)) {
				return false;
			}
			if (sectionFilter && item.section !== sectionFilter) return false;
			if (actionFilter && item.action !== actionFilter) return false;
			if (routeFilter && !item.routePattern.toLowerCase().includes(routeFilter.toLowerCase())) {
				return false;
			}
			return true;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	const pageItems = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	$effect(() => {
		void nameFilter;
		void sectionFilter;
		void actionFilter;
		void routeFilter;
		page = 1;
	});

	$effect(() => {
		if (page > totalPages) page = totalPages;
	});

	$effect(() => {
		if (!bodyEl) return;
		const ro = new ResizeObserver(([entry]) => {
			const height = entry.contentRect.height;
			pageSize = Math.max(1, Math.floor(height / ROW_HEIGHT));
		});
		ro.observe(bodyEl);
		return () => ro.disconnect();
	});

	function showToast(message: string, kind: CrudToastKind = 'success') {
		toastMessage = message;
		toastKind = kind;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastMessage = null;
		}, 3500);
	}

	onDestroy(() => {
		if (toastTimer) clearTimeout(toastTimer);
	});

	async function refreshItems() {
		loading = true;
		try {
			await invalidateAll();
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editing = null;
		formSlug = '';
		formName = '';
		formRoutePattern = '';
		formSection = 'dashboard';
		formAction = 'view';
		formDescription = '';
		dialogOpen = true;
	}

	function openEdit(item: PagePermissionRow) {
		editing = item;
		formSlug = item.slug;
		formName = item.name;
		formRoutePattern = item.routePattern;
		formSection = item.section;
		formAction = item.action;
		formDescription = item.description ?? '';
		dialogOpen = true;
	}

	async function saveItem(event: Event) {
		event.preventDefault();
		if (saving || deleting) return;
		saving = true;
		try {
			const payload = {
				slug: formSlug,
				name: formName,
				routePattern: formRoutePattern,
				section: formSection,
				action: formAction,
				description: formDescription || null
			};
			const res = editing
				? await fetch(`/api/page-permissions/${editing.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					})
				: await fetch('/api/page-permissions', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					});
			if (!res.ok) throw new Error(await res.text());
			dialogOpen = false;
			showToast(editing ? 'Page permission updated' : 'Page permission created');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Save failed', 'error');
		} finally {
			saving = false;
		}
	}

	async function confirmDelete() {
		if (!deleteTarget || deleting || saving) return;
		deleting = true;
		try {
			const res = await fetch(`/api/page-permissions/${deleteTarget.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			deleteTarget = null;
			showToast('Page permission deleted');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Page permissions | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-[calc(100svh-4rem)] flex-col gap-4 lg:h-[calc(100svh-4rem)]">
	<h1 class="text-2xl font-bold text-base-content shrink-0">Page permissions</h1>

	{#if loadError}
		<div class="alert alert-error shrink-0">
			<span>{loadError}</span>
		</div>
	{/if}

	<div class="border-base-300 rounded-box flex min-h-0 flex-1 flex-col overflow-hidden border bg-base-100">
		<div class="min-h-0 flex-1 overflow-auto" bind:this={bodyEl}>
			<table class="table table-zebra [&_tbody_tr]:hover:bg-primary/40">
				<thead class="bg-base-100 sticky top-0 z-10">
					<tr>
						<th class="w-28">Actions</th>
						<th class="w-16">No</th>
						<th>
							<input
								class="input input-sm input-bordered w-full max-w-xs cursor-text font-normal"
								placeholder="Name / slug"
								aria-label="Name or slug"
								bind:value={nameFilter}
							/>
						</th>
						<th>
							<input
								class="input input-sm input-bordered w-full max-w-xs cursor-text font-normal"
								placeholder="Route"
								aria-label="Route pattern"
								bind:value={routeFilter}
							/>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Section"
								bind:value={sectionFilter}
							>
								<option value="">Section</option>
								{#each PERMISSION_SECTIONS as section (section)}
									<option value={section}>{PERMISSION_SECTION_LABELS[section]}</option>
								{/each}
							</select>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Action"
								bind:value={actionFilter}
							>
								<option value="">Action</option>
								{#each PERMISSION_ACTIONS as action (action)}
									<option value={action}>{action}</option>
								{/each}
							</select>
						</th>
						<th>Created</th>
						<th>Updated</th>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						<tr>
							<td colspan="8" class="text-center">
								<span class="loading loading-spinner loading-md"></span>
							</td>
						</tr>
					{:else if pageItems.length === 0}
						<tr>
							<td colspan="8" class="text-base-content/60 text-center">No permissions found</td>
						</tr>
					{:else}
						{#each pageItems as item, index (item.id)}
							<tr>
								<td>
									<div class="flex gap-1">
										{#if data.canUpdate}
											<div class="tooltip tooltip-secondary tooltip-right" data-tip="Edit">
												<button
													type="button"
													class="btn btn-ghost btn-square btn-sm btn-secondary cursor-pointer"
													aria-label="Edit"
													onclick={() => openEdit(item)}
												>
													<Pencil class="h-4 w-4" />
												</button>
											</div>
										{/if}
										{#if data.canDelete}
											<div class="tooltip tooltip-error tooltip-right" data-tip="Delete">
												<button
													type="button"
													class="btn btn-ghost btn-square btn-sm btn-error cursor-pointer"
													aria-label="Delete"
													onclick={() => (deleteTarget = item)}
												>
													<Trash2 class="h-4 w-4" />
												</button>
											</div>
										{/if}
									</div>
								</td>
								<td class="tabular-nums">{(page - 1) * pageSize + index + 1}</td>
								<td>
									<div class="font-medium">{item.name}</div>
									<div class="text-base-content/60 text-sm">{item.slug}</div>
								</td>
								<td class="text-sm">{item.routePattern}</td>
								<td>{PERMISSION_SECTION_LABELS[item.section]}</td>
								<td class="capitalize">{item.action}</td>
								<td class="whitespace-nowrap text-sm">{formatShortDateTime(item.createdAt)}</td>
								<td class="whitespace-nowrap text-sm">{formatShortDateTime(item.updatedAt)}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<div
			class="border-base-300 bg-base-100 flex shrink-0 flex-wrap items-center gap-2 border-t px-3 py-2"
		>
			<span class="text-base-content/60 flex-1 text-sm min-w-0">
				Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(
					page * pageSize,
					filtered.length
				)} of {filtered.length}
			</span>
			<div class="join">
				<button
					type="button"
					class="btn btn-sm join-item cursor-pointer"
					disabled={page <= 1}
					onclick={() => (page -= 1)}
				>
					Prev
				</button>
				<button type="button" class="btn btn-sm join-item cursor-default" disabled>
					{page} / {totalPages}
				</button>
				<button
					type="button"
					class="btn btn-sm join-item cursor-pointer"
					disabled={page >= totalPages}
					onclick={() => (page += 1)}
				>
					Next
				</button>
			</div>
			<div class="flex flex-1 justify-end min-w-0">
				{#if data.canCreate}
					<div class="tooltip tooltip-left tooltip-primary" data-tip="Add permission">
						<button
							type="button"
							class="btn btn-primary btn-sm btn-square cursor-pointer"
							aria-label="Add permission"
							onclick={openCreate}
						>
							<Plus class="h-4 w-4" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<dialog class="modal" class:modal-open={dialogOpen}>
	<div class="modal-box max-w-lg">
		<form method="dialog" onsubmit={saveItem}>
			<h2 class={['card-title font-bold', editing ? 'text-secondary' : 'text-primary']}>
				{editing ? 'Edit page permission' : 'Add page permission'}
			</h2>
			<div class="mt-4 flex flex-col gap-3">
				<label class="form-control w-full" for="perm-slug">
					<span class="label-text mb-1">
						Slug<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="perm-slug"
						class="input input-bordered w-full cursor-text"
						bind:value={formSlug}
						required
					/>
				</label>
				<label class="form-control w-full" for="perm-name">
					<span class="label-text mb-1">
						Name<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="perm-name"
						class="input input-bordered w-full cursor-text"
						bind:value={formName}
						required
					/>
				</label>
				<label class="form-control w-full" for="perm-route">
					<span class="label-text mb-1">
						Route pattern<span class="text-error align-top text-sm leading-none" aria-hidden="true"
							>*</span>
					</span>
					<input
						id="perm-route"
						class="input input-bordered w-full cursor-text"
						bind:value={formRoutePattern}
						required
					/>
				</label>
				<label class="form-control w-full" for="perm-section">
					<span class="label-text mb-1">
						Section<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<select
						id="perm-section"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formSection}
						required
					>
						{#each PERMISSION_SECTIONS as section (section)}
							<option value={section}>{PERMISSION_SECTION_LABELS[section]}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="perm-action">
					<span class="label-text mb-1">
						Action<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<select
						id="perm-action"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formAction}
						required
					>
						{#each PERMISSION_ACTIONS as action (action)}
							<option value={action}>{action}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="perm-description">
					<span class="label-text mb-1">Description</span>
					<textarea
						id="perm-description"
						class="textarea textarea-bordered w-full cursor-text"
						rows="2"
						bind:value={formDescription}
					></textarea>
				</label>
			</div>
			<div class="modal-action">
				<button
					type="button"
					class="btn cursor-pointer"
					onclick={() => (dialogOpen = false)}
					disabled={saving}
				>
					Cancel
				</button>
				<LoadingButton busy={saving} class="btn btn-primary">Save</LoadingButton>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" class="cursor-pointer" onclick={() => (dialogOpen = false)}>close</button>
	</form>
</dialog>

<dialog class="modal" class:modal-open={!!deleteTarget}>
	<div class="modal-box">
		<h2 class="card-title text-error font-bold">Delete page permission</h2>
		<p class="py-3">
			Delete <strong>{deleteTarget?.name}</strong>? Roles using this permission will lose it.
		</p>
		<div class="modal-action">
			<button
				type="button"
				class="btn cursor-pointer"
				onclick={() => (deleteTarget = null)}
				disabled={deleting}
			>
				Cancel
			</button>
			<LoadingButton type="button" busy={deleting} class="btn btn-error" onclick={confirmDelete}>
				Delete
			</LoadingButton>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" class="cursor-pointer" onclick={() => (deleteTarget = null)}>close</button>
	</form>
</dialog>

<CrudToast message={toastMessage} kind={toastKind} />
