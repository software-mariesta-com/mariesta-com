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
		SIDEBAR_SECTIONS,
		type PermissionAction,
		type PermissionSection
	} from '#lib/constants/permissions';
	import { formatShortDateTime } from '#lib/util/format-datetime';
	import type { PageData } from './$types';

	type PagePermissionOption = {
		id: string;
		section: PermissionSection;
		action: PermissionAction;
		name: string;
	};

	type RoleRow = {
		id: string;
		slug: string;
		name: string;
		description: string | null;
		isSystem: boolean;
		permissionIds: string[];
		createdAt: string;
		updatedAt: string;
	};

	let { data }: { data: PageData } = $props();

	let items = $derived(data.items as RoleRow[]);
	let pagePermissions = $derived(data.pagePermissions as PagePermissionOption[]);
	let loading = $state(false);
	let loadError = $derived(data.loadError);

	let nameFilter = $state('');
	let slugFilter = $state('');
	let systemFilter = $state('');
	let page = $state(1);
	let pageSize = $state(8);
	let bodyEl = $state<HTMLDivElement | null>(null);

	let dialogOpen = $state(false);
	let editing = $state<RoleRow | null>(null);
	let formSlug = $state('');
	let formName = $state('');
	let formDescription = $state('');
	let formPermissionIds = $state<string[]>([]);
	let saving = $state(false);

	let deleteTarget = $state<RoleRow | null>(null);
	let deleting = $state(false);

	let toastMessage = $state<string | null>(null);
	let toastKind = $state<CrudToastKind>('success');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const ROW_HEIGHT = 48;
	const matrixSections = SIDEBAR_SECTIONS;

	const filtered = $derived(
		items.filter((item) => {
			if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
			if (slugFilter && !item.slug.toLowerCase().includes(slugFilter.toLowerCase())) return false;
			if (systemFilter === 'yes' && !item.isSystem) return false;
			if (systemFilter === 'no' && item.isSystem) return false;
			return true;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	const pageItems = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	const permissionsBySection = $derived(
		matrixSections.map((section) => ({
			section,
			entries: pagePermissions.filter((perm) => perm.section === section)
		}))
	);

	const permissionsLocked = $derived(
		editing?.slug === 'owner' || editing?.slug === 'admin' || formSlug === 'owner' || formSlug === 'admin'
	);

	$effect(() => {
		void nameFilter;
		void slugFilter;
		void systemFilter;
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

	function permissionId(section: PermissionSection, action: PermissionAction): string | undefined {
		return pagePermissions.find((perm) => perm.section === section && perm.action === action)?.id;
	}

	function hasPermission(section: PermissionSection, action: PermissionAction): boolean {
		const id = permissionId(section, action);
		return id ? formPermissionIds.includes(id) : false;
	}

	function togglePermission(section: PermissionSection, action: PermissionAction, checked: boolean) {
		const id = permissionId(section, action);
		if (!id) return;

		if (checked) {
			if (!formPermissionIds.includes(id)) {
				formPermissionIds = [...formPermissionIds, id];
			}
			if (action !== 'view') {
				const viewId = permissionId(section, 'view');
				if (viewId && !formPermissionIds.includes(viewId)) {
					formPermissionIds = [...formPermissionIds, viewId];
				}
			}
		} else {
			if (action === 'view') {
				const sectionIds = pagePermissions
					.filter((perm) => perm.section === section)
					.map((perm) => perm.id);
				formPermissionIds = formPermissionIds.filter((pid) => !sectionIds.includes(pid));
			} else {
				formPermissionIds = formPermissionIds.filter((pid) => pid !== id);
			}
		}
	}

	function toggleSectionView(section: PermissionSection, checked: boolean) {
		const sectionIds = pagePermissions.filter((perm) => perm.section === section).map((perm) => perm.id);
		if (checked) {
			const viewId = permissionId(section, 'view');
			if (viewId) {
				formPermissionIds = [...new Set([...formPermissionIds, viewId])];
			}
		} else {
			formPermissionIds = formPermissionIds.filter((pid) => !sectionIds.includes(pid));
		}
	}

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
		formDescription = '';
		formPermissionIds = [];
		dialogOpen = true;
	}

	function openEdit(item: RoleRow) {
		editing = item;
		formSlug = item.slug;
		formName = item.name;
		formDescription = item.description ?? '';
		formPermissionIds = [...item.permissionIds];
		dialogOpen = true;
	}

	async function saveItem(event: Event) {
		event.preventDefault();
		if (saving || deleting) return;
		saving = true;
		try {
			const payload: Record<string, unknown> = {
				slug: formSlug,
				name: formName,
				description: formDescription || null
			};
			if (!permissionsLocked) {
				payload.permissionIds = formPermissionIds;
			}

			const res = editing
				? await fetch(`/api/roles/${editing.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					})
				: await fetch('/api/roles', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					});
			if (!res.ok) throw new Error(await res.text());
			dialogOpen = false;
			showToast(editing ? 'Role updated' : 'Role created');
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
			const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			deleteTarget = null;
			showToast('Role deleted');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Roles | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-[calc(100svh-4rem)] flex-col gap-4 lg:h-[calc(100svh-4rem)]">
	<h1 class="text-2xl font-bold text-base-content shrink-0">Roles</h1>

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
								placeholder="Name"
								aria-label="Name"
								bind:value={nameFilter}
							/>
						</th>
						<th>
							<input
								class="input input-sm input-bordered w-full max-w-xs cursor-text font-normal"
								placeholder="Slug"
								aria-label="Slug"
								bind:value={slugFilter}
							/>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="System"
								bind:value={systemFilter}
							>
								<option value="">System</option>
								<option value="yes">System</option>
								<option value="no">Custom</option>
							</select>
						</th>
						<th>Created</th>
						<th>Updated</th>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						<tr>
							<td colspan="7" class="text-center">
								<span class="loading loading-spinner loading-md"></span>
							</td>
						</tr>
					{:else if pageItems.length === 0}
						<tr>
							<td colspan="7" class="text-base-content/60 text-center">No roles found</td>
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
										{#if data.canDelete && !item.isSystem}
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
									{#if item.description}
										<div class="text-base-content/60 text-sm">{item.description}</div>
									{/if}
								</td>
								<td><code class="text-sm">{item.slug}</code></td>
								<td>
									<span class={['badge badge-sm', item.isSystem ? 'badge-info' : 'badge-ghost']}>
										{item.isSystem ? 'System' : 'Custom'}
									</span>
								</td>
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
					<div class="tooltip tooltip-left tooltip-primary" data-tip="Add role">
						<button
							type="button"
							class="btn btn-primary btn-sm btn-square cursor-pointer"
							aria-label="Add role"
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
	<div class="modal-box max-w-2xl">
		<form method="dialog" onsubmit={saveItem}>
			<h2 class={['card-title font-bold', editing ? 'text-secondary' : 'text-primary']}>
				{editing ? 'Edit role' : 'Add role'}
			</h2>
			<div class="mt-4 flex flex-col gap-3">
				<label class="form-control w-full" for="role-slug">
					<span class="label-text mb-1">
						Slug<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="role-slug"
						class="input input-bordered w-full cursor-text"
						bind:value={formSlug}
						required
						disabled={editing?.isSystem}
					/>
				</label>
				<label class="form-control w-full" for="role-name">
					<span class="label-text mb-1">
						Name<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="role-name"
						class="input input-bordered w-full cursor-text"
						bind:value={formName}
						required
					/>
				</label>
				<label class="form-control w-full" for="role-description">
					<span class="label-text mb-1">Description</span>
					<textarea
						id="role-description"
						class="textarea textarea-bordered w-full cursor-text"
						rows="2"
						bind:value={formDescription}
					></textarea>
				</label>

				{#if permissionsLocked}
					<p class="text-sm text-base-content/70">
						Owner and admin roles always have full access. Permissions cannot be edited here.
					</p>
				{:else if pagePermissions.length > 0}
					<div class="overflow-x-auto">
						<p class="label-text mb-2 font-medium">Page permissions</p>
						<table class="table table-sm table-zebra [&_tbody_tr]:hover:bg-primary/40">
							<thead>
								<tr>
									<th>Section</th>
									{#each PERMISSION_ACTIONS as action (action)}
										<th class="text-center capitalize">{action}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each permissionsBySection as group (group.section)}
									<tr>
										<td>{PERMISSION_SECTION_LABELS[group.section]}</td>
										{#each PERMISSION_ACTIONS as action (action)}
											<td class="text-center">
												{#if permissionId(group.section, action)}
													<input
														type="checkbox"
														class="checkbox checkbox-sm cursor-pointer"
														checked={hasPermission(group.section, action)}
														onchange={(e) => {
															const checked = e.currentTarget.checked;
															if (action === 'view') {
																toggleSectionView(group.section, checked);
															} else {
																togglePermission(group.section, action, checked);
															}
														}}
														aria-label={`${PERMISSION_SECTION_LABELS[group.section]} ${action}`}
													/>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-sm text-warning">No page permissions loaded. Save the role after they are seeded.</p>
				{/if}
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
		<h2 class="card-title text-error font-bold">Delete role</h2>
		<p class="py-3">
			Delete role <strong>{deleteTarget?.name}</strong>? Users must be reassigned first.
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
