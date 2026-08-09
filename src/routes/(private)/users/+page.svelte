<script lang="ts">
	import { onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Mail from '@lucide/svelte/icons/mail';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CrudToast, { type CrudToastKind } from '#lib/components/CrudToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import {
		PERMISSION_ACTIONS,
		PERMISSION_SECTION_LABELS,
		PERMISSION_SECTIONS,
		SIDEBAR_SECTIONS,
		defaultMemberPermissions,
		type PermissionAction,
		type PermissionSection,
		type SectionPermissions,
		type UserPermissions
	} from '#lib/constants/permissions';
	import { formatShortDateTime } from '#lib/util/format-datetime';
	import type { PageData } from './$types';

	type AuthUserRow = {
		id: string;
		name: string;
		email: string;
		role: 'owner' | 'admin' | 'member';
		permissions: UserPermissions | null;
		twoFactorEnabled: boolean | null;
		createdAt: string;
		updatedAt: string;
	};

	let { data }: { data: PageData } = $props();

	let items = $derived(data.items as AuthUserRow[]);
	let loading = $state(false);
	let loadError = $derived(data.loadError);

	let nameFilter = $state('');
	let roleFilter = $state('');
	let twoFaFilter = $state('');
	let page = $state(1);
	let pageSize = $state(8);
	let bodyEl = $state<HTMLDivElement | null>(null);

	let dialogOpen = $state(false);
	let editing = $state<AuthUserRow | null>(null);
	let formName = $state('');
	let formEmail = $state('');
	let formRole = $state<'admin' | 'member'>('member');
	let formPermissions = $state<UserPermissions>(defaultMemberPermissions());
	let saving = $state(false);

	let deleteTarget = $state<AuthUserRow | null>(null);
	let deleting = $state(false);
	let resendingId = $state<string | null>(null);

	let toastMessage = $state<string | null>(null);
	let toastKind = $state<CrudToastKind>('success');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const ROW_HEIGHT = 48;
	const actorRole = $derived(data.user?.role ?? 'member');
	const canInviteAdmin = $derived(actorRole === 'owner');

	const filtered = $derived(
		items.filter((item) => {
			const q = nameFilter.toLowerCase();
			if (q && !item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) {
				return false;
			}
			if (roleFilter && item.role !== roleFilter) return false;
			if (twoFaFilter === 'on' && !item.twoFactorEnabled) return false;
			if (twoFaFilter === 'off' && item.twoFactorEnabled) return false;
			return true;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	const pageItems = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	$effect(() => {
		void nameFilter;
		void roleFilter;
		void twoFaFilter;
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

	function clonePermissions(source?: UserPermissions | null): UserPermissions {
		const base = defaultMemberPermissions();
		if (!source) return base;
		for (const section of PERMISSION_SECTIONS) {
			if (source[section]) {
				base[section] = { ...source[section]! };
			}
		}
		return base;
	}

	function openCreate() {
		if (!data.canCreate) {
			showToast('Enable 2FA in Profile to invite users, or you lack permission', 'warning');
			return;
		}
		editing = null;
		formName = '';
		formEmail = '';
		formRole = 'member';
		formPermissions = defaultMemberPermissions();
		dialogOpen = true;
	}

	function openEdit(item: AuthUserRow) {
		if (!data.canUpdate || item.role === 'owner') {
			showToast(
				item.role === 'owner' ? 'Owner cannot be edited here' : 'You cannot edit users',
				'warning'
			);
			return;
		}
		editing = item;
		formName = item.name;
		formEmail = item.email;
		formRole = item.role === 'admin' ? 'admin' : 'member';
		formPermissions = clonePermissions(item.permissions);
		dialogOpen = true;
	}

	function setPerm(section: PermissionSection, action: PermissionAction, value: boolean) {
		const current = formPermissions[section] ?? {
			view: false,
			create: false,
			update: false,
			delete: false
		};
		formPermissions = {
			...formPermissions,
			[section]: { ...current, [action]: value }
		};
	}

	function toggleSectionView(section: PermissionSection, value: boolean) {
		const next: SectionPermissions = value
			? { view: true, create: false, update: false, delete: false }
			: { view: false, create: false, update: false, delete: false };
		formPermissions = { ...formPermissions, [section]: next };
	}

	async function saveItem(event: Event) {
		event.preventDefault();
		if (saving || deleting) return;
		saving = true;
		try {
			if (editing) {
				const payload: Record<string, unknown> = {
					name: formName,
					role: formRole
				};
				if (formRole === 'member') payload.permissions = formPermissions;
				const res = await fetch(`/api/users/${editing.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				if (!res.ok) throw new Error(await res.text());
				showToast('User updated');
			} else {
				const payload: Record<string, unknown> = {
					name: formName,
					email: formEmail,
					role: formRole
				};
				if (formRole === 'member') payload.permissions = formPermissions;
				const res = await fetch('/api/users', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				if (!res.ok) throw new Error(await res.text());
				showToast('Invite sent. User should set password from the email link.');
			}
			dialogOpen = false;
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
			const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			deleteTarget = null;
			showToast('User deleted');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
		} finally {
			deleting = false;
		}
	}

	async function resendInvite(item: AuthUserRow) {
		if (resendingId) return;
		resendingId = item.id;
		try {
			const res = await fetch(`/api/users/${item.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'resend-invite' })
			});
			if (!res.ok) throw new Error(await res.text());
			showToast('Password set link resent');
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Resend failed', 'error');
		} finally {
			resendingId = null;
		}
	}

	const matrixSections = SIDEBAR_SECTIONS;
</script>

<svelte:head>
	<title>Users | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-[calc(100svh-4rem)] flex-col gap-4 lg:h-[calc(100svh-4rem)]">
	<h1 class="text-2xl font-bold text-base-content shrink-0">Users</h1>

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
								placeholder="Name / email"
								aria-label="Name or email"
								bind:value={nameFilter}
							/>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Role"
								bind:value={roleFilter}
							>
								<option value="">Role</option>
								<option value="owner">Owner</option>
								<option value="admin">Admin</option>
								<option value="member">Member</option>
							</select>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="2FA"
								bind:value={twoFaFilter}
							>
								<option value="">2FA</option>
								<option value="on">Enabled</option>
								<option value="off">Off</option>
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
							<td colspan="7" class="text-base-content/60 text-center">No users found</td>
						</tr>
					{:else}
						{#each pageItems as item, index (item.id)}
							<tr>
								<td>
									<div class="flex gap-1">
										{#if data.canUpdate && item.role !== 'owner'}
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
											<div
												class="tooltip tooltip-info tooltip-right"
												data-tip={resendingId === item.id ? 'Sending…' : 'Resend invite'}
											>
												<button
													type="button"
													class="btn btn-ghost btn-square btn-sm btn-info {resendingId === item.id
														? 'cursor-wait'
														: 'cursor-pointer'}"
													aria-label={resendingId === item.id ? 'Sending…' : 'Resend invite'}
													aria-busy={resendingId === item.id}
													disabled={resendingId === item.id}
													onclick={() => resendInvite(item)}
												>
													{#if resendingId === item.id}
														<span class="loading loading-spinner loading-sm"></span>
													{:else}
														<Mail class="h-4 w-4" />
													{/if}
												</button>
											</div>
										{/if}
										{#if data.canDelete && item.role !== 'owner'}
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
									<div class="text-base-content/60 text-sm">{item.email}</div>
								</td>
								<td>
									<span
										class={[
											'badge badge-sm capitalize',
											item.role === 'owner'
												? 'badge-primary'
												: item.role === 'admin'
													? 'badge-secondary'
													: 'badge-ghost'
										]}
									>
										{item.role}
									</span>
								</td>
								<td>
									<span
										class={[
											'badge badge-sm',
											item.twoFactorEnabled ? 'badge-success' : 'badge-warning'
										]}
									>
										{item.twoFactorEnabled ? 'On' : 'Off'}
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
					<div class="tooltip tooltip-left tooltip-primary" data-tip="Invite user">
						<button
							type="button"
							class="btn btn-primary btn-sm btn-square cursor-pointer"
							aria-label="Invite user"
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
				{editing ? 'Edit user' : 'Invite user'}
			</h2>
			<div class="mt-4 flex flex-col gap-3">
				<label class="form-control w-full" for="user-name">
					<span class="label-text mb-1">
						Name<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="user-name"
						class="input input-bordered w-full cursor-text"
						bind:value={formName}
						required
					/>
				</label>
				{#if !editing}
					<label class="form-control w-full" for="user-email">
						<span class="label-text mb-1">
							Email<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
						</span>
						<input
							id="user-email"
							class="input input-bordered w-full cursor-text"
							type="email"
							bind:value={formEmail}
							required
						/>
					</label>
				{:else}
					<p class="text-sm text-base-content/70">{formEmail}</p>
				{/if}
				<label class="form-control w-full" for="user-role">
					<span class="label-text mb-1">
						Role<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<select
						id="user-role"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formRole}
						required
					>
						<option value="member">Member</option>
						{#if canInviteAdmin}
							<option value="admin">Admin</option>
						{/if}
					</select>
				</label>

				{#if formRole === 'member'}
					<div class="overflow-x-auto">
						<p class="label-text mb-2 font-medium">Permissions</p>
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
								{#each matrixSections as section (section)}
									{@const perms = formPermissions[section]}
									<tr>
										<td>{PERMISSION_SECTION_LABELS[section]}</td>
										{#each PERMISSION_ACTIONS as action (action)}
											<td class="text-center">
												<input
													type="checkbox"
													class="checkbox checkbox-sm cursor-pointer"
													checked={Boolean(perms?.[action])}
													onchange={(e) => {
														const checked = e.currentTarget.checked;
														if (action === 'view') {
															toggleSectionView(section, checked);
														} else {
															setPerm(section, action, checked);
															if (checked) setPerm(section, 'view', true);
														}
													}}
													aria-label={`${PERMISSION_SECTION_LABELS[section]} ${action}`}
												/>
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-sm text-base-content/70">Admins have full access to all sections.</p>
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
				<LoadingButton busy={saving} class="btn btn-primary">
					{editing ? 'Save' : 'Send invite'}
				</LoadingButton>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" class="cursor-pointer" onclick={() => (dialogOpen = false)}>close</button>
	</form>
</dialog>

<dialog class="modal" class:modal-open={!!deleteTarget}>
	<div class="modal-box">
		<h2 class="card-title text-error font-bold">Delete user</h2>
		<p class="py-3">
			Delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? They will lose access
			immediately.
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
