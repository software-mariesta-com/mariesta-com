<script lang="ts">
	import { onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CrudToast, { type CrudToastKind } from '#lib/components/CrudToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import { PUBLISH_STATUSES, PUBLISH_STATUS_LABELS } from '#lib/constants/publish-status';
	import { formatShortDateTime } from '#lib/util/format-datetime';
	import { uploadImage } from '#lib/util/upload-image';
	import type { PageData } from './$types';

	type DepartmentOption = {
		id: string;
		name: string;
	};

	type Member = {
		id: string;
		departmentId: string;
		name: string;
		role: string;
		photoUrl: string | null;
		linkUrl: string | null;
		status: 'draft' | 'published';
		createdAt: string;
		updatedAt: string;
		department?: { id: string; name: string };
	};

	let { data }: { data: PageData } = $props();

	let items = $derived(data.items as Member[]);
	let departments = $derived(data.departments as DepartmentOption[]);
	let loading = $state(false);
	let loadError = $derived(data.loadError);

	let nameFilter = $state('');
	let roleFilter = $state('');
	let departmentFilter = $state('');
	let statusFilter = $state('');
	let page = $state(1);
	let pageSize = $state(8);
	let bodyEl = $state<HTMLDivElement | null>(null);

	let dialogOpen = $state(false);
	let editing = $state<Member | null>(null);
	let formDepartmentId = $state('');
	let formName = $state('');
	let formRole = $state('');
	let formStatus = $state<'draft' | 'published'>('draft');
	let formPhotoUrl = $state<string | null>(null);
	let formLinkUrl = $state('');
	let uploading = $state(false);
	let saving = $state(false);

	let deleteTarget = $state<Member | null>(null);
	let deleting = $state(false);

	let toastMessage = $state<string | null>(null);
	let toastKind = $state<CrudToastKind>('success');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const ROW_HEIGHT = 48;

	const filtered = $derived(
		items.filter((item) => {
			if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
			if (roleFilter && !item.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
			if (departmentFilter && item.departmentId !== departmentFilter) return false;
			if (statusFilter && item.status !== statusFilter) return false;
			return true;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	const pageItems = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	$effect(() => {
		void nameFilter;
		void roleFilter;
		void departmentFilter;
		void statusFilter;
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
		formDepartmentId = departmentFilter || departments[0]?.id || '';
		formName = '';
		formRole = '';
		formStatus = 'draft';
		formPhotoUrl = null;
		formLinkUrl = '';
		dialogOpen = true;
	}

	function openEdit(item: Member) {
		editing = item;
		formDepartmentId = item.departmentId;
		formName = item.name;
		formRole = item.role;
		formStatus = item.status;
		formPhotoUrl = item.photoUrl;
		formLinkUrl = item.linkUrl ?? '';
		dialogOpen = true;
	}

	async function onPhotoChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		try {
			const result = await uploadImage(file, 'members');
			formPhotoUrl = result.url;
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	async function saveItem(event: Event) {
		event.preventDefault();
		if (saving || deleting || uploading) return;
		saving = true;
		try {
			const payload = {
				departmentId: formDepartmentId,
				name: formName,
				role: formRole,
				status: formStatus,
				photoUrl: formPhotoUrl,
				linkUrl: formLinkUrl.trim() || null
			};
			const res = editing
				? await fetch(`/api/members/${editing.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					})
				: await fetch('/api/members', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					});
			if (!res.ok) throw new Error(await res.text());
			dialogOpen = false;
			showToast(editing ? 'Member updated' : 'Member created');
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
			const res = await fetch(`/api/members/${deleteTarget.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			deleteTarget = null;
			showToast('Member deleted');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Members | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-[calc(100svh-4rem)] flex-col gap-4 lg:h-[calc(100svh-4rem)]">
	<h1 class="text-2xl font-bold text-base-content shrink-0">Members</h1>

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
						<th class="w-24">Actions</th>
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
								placeholder="Role"
								aria-label="Role"
								bind:value={roleFilter}
							/>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Department"
								bind:value={departmentFilter}
							>
								<option value="">Department</option>
								{#each departments as dept (dept.id)}
									<option value={dept.id}>{dept.name}</option>
								{/each}
							</select>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Status"
								bind:value={statusFilter}
							>
								<option value="">Status</option>
								{#each PUBLISH_STATUSES as status (status)}
									<option value={status}>{PUBLISH_STATUS_LABELS[status]}</option>
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
							<td colspan="8" class="text-base-content/60 text-center">No members found</td>
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
								<td class="font-medium">{item.name}</td>
								<td>{item.role}</td>
								<td>{item.department?.name ?? '-'}</td>
								<td>
									<span
										class={[
											'badge badge-sm',
											item.status === 'published' ? 'badge-success' : 'badge-ghost'
										]}
									>
										{PUBLISH_STATUS_LABELS[item.status]}
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
					<div class="tooltip tooltip-left tooltip-primary" data-tip="Add member">
					<button
						type="button"
						class="btn btn-primary btn-sm btn-square cursor-pointer"
						aria-label="Add member"
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
				{editing ? 'Edit member' : 'Add member'}
			</h2>
			<div class="mt-4 flex flex-col gap-3">
				<label class="form-control w-full" for="member-department">
					<span class="label-text mb-1">
						Department<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<select
						id="member-department"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formDepartmentId}
						required
					>
						<option value="" disabled>Select department</option>
						{#each departments as dept (dept.id)}
							<option value={dept.id}>{dept.name}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="member-name">
					<span class="label-text mb-1">
						Name<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="member-name"
						class="input input-bordered w-full cursor-text"
						bind:value={formName}
						required
					/>
				</label>
				<label class="form-control w-full" for="member-role">
					<span class="label-text mb-1">
						Role<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="member-role"
						class="input input-bordered w-full cursor-text"
						bind:value={formRole}
						required
					/>
				</label>
				<label class="form-control w-full" for="member-link">
					<span class="label-text mb-1">Link</span>
					<input
						id="member-link"
						class="input input-bordered w-full cursor-text"
						type="url"
						placeholder="https://"
						bind:value={formLinkUrl}
					/>
				</label>
				<label class="form-control w-full" for="member-status">
					<span class="label-text mb-1">
						Status<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<select
						id="member-status"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formStatus}
						required
					>
						{#each PUBLISH_STATUSES as status (status)}
							<option value={status}>{PUBLISH_STATUS_LABELS[status]}</option>
						{/each}
					</select>
				</label>
				<div class="form-control w-full">
					<span class="label-text mb-1">Photo</span>
					{#if formPhotoUrl}
						<div class="mb-2 flex items-center gap-3">
							<img
								src={formPhotoUrl}
								alt=""
								class="h-16 w-16 rounded-box object-cover"
							/>
							<button
								type="button"
								class="btn btn-ghost btn-sm cursor-pointer"
								onclick={() => (formPhotoUrl = null)}
								disabled={uploading || saving}
							>
								Clear photo
							</button>
						</div>
					{/if}
					<input
						id="member-photo"
						type="file"
						accept="image/*"
						class="file-input file-input-bordered w-full cursor-pointer"
						onchange={onPhotoChange}
						disabled={uploading || saving}
					/>
					{#if uploading}
						<span class="text-base-content/60 mt-1 text-sm">Uploading...</span>
					{/if}
				</div>
			</div>
			<div class="modal-action">
				<button
					type="button"
					class="btn cursor-pointer"
					onclick={() => (dialogOpen = false)}
					disabled={saving || uploading}
				>
					Cancel
				</button>
				<LoadingButton busy={saving} class="btn btn-primary" disabled={uploading}>Save</LoadingButton>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" class="cursor-pointer" onclick={() => (dialogOpen = false)}>close</button>
	</form>
</dialog>

<dialog class="modal" class:modal-open={!!deleteTarget}>
	<div class="modal-box">
		<h2 class="card-title text-error font-bold">Delete member</h2>
		<p class="py-3">
			Delete <strong>{deleteTarget?.name}</strong>?
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
