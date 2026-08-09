<script lang="ts">
	import { onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CrudToast, { type CrudToastKind } from '#lib/components/CrudToast.svelte';
	import {
		EMPLOYMENT_TYPES,
		EMPLOYMENT_TYPE_LABELS,
		SALARY_UNITS,
		SALARY_UNIT_LABELS,
		WORKPLACE_TYPES,
		WORKPLACE_TYPE_LABELS,
		type EmploymentType,
		type SalaryUnit,
		type WorkplaceType
	} from '#lib/constants/career';
	import { PUBLISH_STATUSES, PUBLISH_STATUS_LABELS } from '#lib/constants/publish-status';
	import { formatShortDateTime } from '#lib/util/format-datetime';
	import type { PageData } from './$types';

	type BusinessOption = {
		id: string;
		name: string;
	};

	type Career = {
		id: string;
		title: string;
		slug: string;
		description: string;
		location: string;
		locationCountry: string;
		employmentType: EmploymentType;
		workplaceType: WorkplaceType;
		applyUrl: string | null;
		applyEmail: string | null;
		businessId: string | null;
		departmentLabel: string | null;
		salaryMin: number | null;
		salaryMax: number | null;
		salaryCurrency: string | null;
		salaryUnit: SalaryUnit | null;
		expiresAt: string | null;
		status: 'draft' | 'published';
		sortOrder: number;
		createdAt: string;
		updatedAt: string;
		business?: { id: string; name: string } | null;
	};

	let { data }: { data: PageData } = $props();

	let items = $derived(data.items as Career[]);
	let businesses = $derived(data.businesses as BusinessOption[]);
	let loading = $state(false);
	let loadError = $derived(data.loadError);

	let titleFilter = $state('');
	let locationFilter = $state('');
	let employmentFilter = $state('');
	let workplaceFilter = $state('');
	let statusFilter = $state('');
	let page = $state(1);
	let pageSize = $state(8);
	let bodyEl = $state<HTMLDivElement | null>(null);

	let dialogOpen = $state(false);
	let editing = $state<Career | null>(null);
	let slugManual = $state(false);
	let formTitle = $state('');
	let formSlug = $state('');
	let formDescription = $state('');
	let formLocation = $state('');
	let formLocationCountry = $state('MM');
	let formEmploymentType = $state<EmploymentType>('full_time');
	let formWorkplaceType = $state<WorkplaceType>('onsite');
	let formApplyUrl = $state('');
	let formApplyEmail = $state('');
	let formBusinessId = $state('');
	let formDepartmentLabel = $state('');
	let formSalaryMin = $state('');
	let formSalaryMax = $state('');
	let formSalaryCurrency = $state('USD');
	let formSalaryUnit = $state<SalaryUnit | ''>('');
	let formExpiresAt = $state('');
	let formStatus = $state<'draft' | 'published'>('draft');
	let formSortOrder = $state(0);
	let saving = $state(false);

	let deleteTarget = $state<Career | null>(null);
	let deleting = $state(false);

	let toastMessage = $state<string | null>(null);
	let toastKind = $state<CrudToastKind>('success');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const ROW_HEIGHT = 48;

	const filtered = $derived(
		items.filter((item) => {
			if (titleFilter && !item.title.toLowerCase().includes(titleFilter.toLowerCase())) return false;
			if (locationFilter && !item.location.toLowerCase().includes(locationFilter.toLowerCase()))
				return false;
			if (employmentFilter && item.employmentType !== employmentFilter) return false;
			if (workplaceFilter && item.workplaceType !== workplaceFilter) return false;
			if (statusFilter && item.status !== statusFilter) return false;
			return true;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	const pageItems = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	$effect(() => {
		void titleFilter;
		void locationFilter;
		void employmentFilter;
		void workplaceFilter;
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

	function slugify(value: string) {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 120);
	}

	function onTitleInput() {
		if (!slugManual) formSlug = slugify(formTitle);
	}

	function toDateInput(value: string | null) {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toISOString().slice(0, 10);
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
		slugManual = false;
		formTitle = '';
		formSlug = '';
		formDescription = '';
		formLocation = '';
		formLocationCountry = 'MM';
		formEmploymentType = 'full_time';
		formWorkplaceType = 'onsite';
		formApplyUrl = '';
		formApplyEmail = '';
		formBusinessId = '';
		formDepartmentLabel = '';
		formSalaryMin = '';
		formSalaryMax = '';
		formSalaryCurrency = 'USD';
		formSalaryUnit = '';
		formExpiresAt = '';
		formStatus = 'draft';
		formSortOrder = 0;
		dialogOpen = true;
	}

	function openEdit(item: Career) {
		editing = item;
		slugManual = true;
		formTitle = item.title;
		formSlug = item.slug;
		formDescription = item.description;
		formLocation = item.location;
		formLocationCountry = item.locationCountry;
		formEmploymentType = item.employmentType;
		formWorkplaceType = item.workplaceType;
		formApplyUrl = item.applyUrl ?? '';
		formApplyEmail = item.applyEmail ?? '';
		formBusinessId = item.businessId ?? '';
		formDepartmentLabel = item.departmentLabel ?? '';
		formSalaryMin = item.salaryMin != null ? String(item.salaryMin) : '';
		formSalaryMax = item.salaryMax != null ? String(item.salaryMax) : '';
		formSalaryCurrency = item.salaryCurrency ?? 'USD';
		formSalaryUnit = item.salaryUnit ?? '';
		formExpiresAt = toDateInput(item.expiresAt);
		formStatus = item.status;
		formSortOrder = item.sortOrder;
		dialogOpen = true;
	}

	async function saveItem(event: Event) {
		event.preventDefault();
		saving = true;
		try {
			const hasSalary = formSalaryMin !== '' || formSalaryMax !== '';
			const payload = {
				title: formTitle,
				slug: formSlug,
				description: formDescription,
				location: formLocation,
				locationCountry: formLocationCountry,
				employmentType: formEmploymentType,
				workplaceType: formWorkplaceType,
				applyUrl: formApplyUrl.trim() || null,
				applyEmail: formApplyEmail.trim() || null,
				businessId: formBusinessId || null,
				departmentLabel: formDepartmentLabel.trim() || null,
				salaryMin: formSalaryMin === '' ? null : Number(formSalaryMin),
				salaryMax: formSalaryMax === '' ? null : Number(formSalaryMax),
				salaryCurrency: hasSalary ? formSalaryCurrency || 'USD' : null,
				salaryUnit: hasSalary && formSalaryUnit ? formSalaryUnit : null,
				expiresAt: formExpiresAt || null,
				status: formStatus,
				sortOrder: formSortOrder
			};
			const res = editing
				? await fetch(`/api/careers/${editing.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					})
				: await fetch('/api/careers', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload)
					});
			if (!res.ok) throw new Error(await res.text());
			dialogOpen = false;
			showToast(editing ? 'Job post updated' : 'Job post created');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Save failed', 'error');
		} finally {
			saving = false;
		}
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		deleting = true;
		try {
			const res = await fetch(`/api/careers/${deleteTarget.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			deleteTarget = null;
			showToast('Job post deleted');
			await refreshItems();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Careers | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-[calc(100svh-4rem)] flex-col gap-4 lg:h-[calc(100svh-4rem)]">
	<h1 class="text-2xl font-bold text-base-content shrink-0">Careers</h1>

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
								placeholder="Title"
								aria-label="Title"
								bind:value={titleFilter}
							/>
						</th>
						<th>
							<input
								class="input input-sm input-bordered w-full max-w-xs cursor-text font-normal"
								placeholder="Location"
								aria-label="Location"
								bind:value={locationFilter}
							/>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Type"
								bind:value={employmentFilter}
							>
								<option value="">Type</option>
								{#each EMPLOYMENT_TYPES as type (type)}
									<option value={type}>{EMPLOYMENT_TYPE_LABELS[type]}</option>
								{/each}
							</select>
						</th>
						<th>
							<select
								class="select select-sm select-bordered cursor-pointer font-normal"
								aria-label="Workplace"
								bind:value={workplaceFilter}
							>
								<option value="">Workplace</option>
								{#each WORKPLACE_TYPES as type (type)}
									<option value={type}>{WORKPLACE_TYPE_LABELS[type]}</option>
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
							<td colspan="9" class="text-center">
								<span class="loading loading-spinner loading-md"></span>
							</td>
						</tr>
					{:else if pageItems.length === 0}
						<tr>
							<td colspan="9" class="text-base-content/60 text-center">No job posts found</td>
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
								<td class="font-medium">{item.title}</td>
								<td>{item.location}</td>
								<td>{EMPLOYMENT_TYPE_LABELS[item.employmentType]}</td>
								<td>{WORKPLACE_TYPE_LABELS[item.workplaceType]}</td>
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
					<div class="tooltip tooltip-left tooltip-primary" data-tip="Add job post">
					<button
						type="button"
						class="btn btn-primary btn-sm btn-square cursor-pointer"
						aria-label="Add job post"
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
	<div class="modal-box max-h-[90vh] max-w-2xl overflow-y-auto">
		<form method="dialog" onsubmit={saveItem}>
			<h2 class={['card-title font-bold', editing ? 'text-secondary' : 'text-primary']}>
				{editing ? 'Edit job post' : 'Add job post'}
			</h2>
			<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
				<label class="form-control w-full sm:col-span-2" for="career-title">
					<span class="label-text mb-1">
						Title<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="career-title"
						class="input input-bordered w-full cursor-text"
						bind:value={formTitle}
						oninput={onTitleInput}
						required
					/>
				</label>
				<label class="form-control w-full sm:col-span-2" for="career-slug">
					<span class="label-text mb-1">
						Slug<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="career-slug"
						class="input input-bordered w-full cursor-text"
						bind:value={formSlug}
						oninput={() => (slugManual = true)}
						required
					/>
				</label>
				<label class="form-control w-full sm:col-span-2" for="career-description">
					<span class="label-text mb-1">
						Description<span class="text-error align-top text-sm leading-none" aria-hidden="true"
							>*</span
						>
					</span>
					<textarea
						id="career-description"
						class="textarea textarea-bordered w-full cursor-text"
						rows="6"
						bind:value={formDescription}
						required
					></textarea>
				</label>
				<label class="form-control w-full" for="career-location">
					<span class="label-text mb-1">
						Location<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="career-location"
						class="input input-bordered w-full cursor-text"
						placeholder="Yangon"
						bind:value={formLocation}
						required
					/>
				</label>
				<label class="form-control w-full" for="career-country">
					<span class="label-text mb-1">
						Country<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<input
						id="career-country"
						class="input input-bordered w-full cursor-text"
						maxlength="2"
						bind:value={formLocationCountry}
						required
					/>
				</label>
				<label class="form-control w-full" for="career-employment">
					<span class="label-text mb-1">
						Employment type<span
							class="text-error align-top text-sm leading-none"
							aria-hidden="true">*</span
						>
					</span>
					<select
						id="career-employment"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formEmploymentType}
						required
					>
						{#each EMPLOYMENT_TYPES as type (type)}
							<option value={type}>{EMPLOYMENT_TYPE_LABELS[type]}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="career-workplace">
					<span class="label-text mb-1">
						Workplace<span class="text-error align-top text-sm leading-none" aria-hidden="true"
							>*</span
						>
					</span>
					<select
						id="career-workplace"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formWorkplaceType}
						required
					>
						{#each WORKPLACE_TYPES as type (type)}
							<option value={type}>{WORKPLACE_TYPE_LABELS[type]}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="career-apply-url">
					<span class="label-text mb-1">Apply URL</span>
					<input
						id="career-apply-url"
						class="input input-bordered w-full cursor-text"
						type="url"
						placeholder="https://"
						bind:value={formApplyUrl}
					/>
				</label>
				<label class="form-control w-full" for="career-apply-email">
					<span class="label-text mb-1">Apply email</span>
					<input
						id="career-apply-email"
						class="input input-bordered w-full cursor-text"
						type="email"
						bind:value={formApplyEmail}
					/>
				</label>
				<label class="form-control w-full" for="career-business">
					<span class="label-text mb-1">Business</span>
					<select
						id="career-business"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formBusinessId}
					>
						<option value="">None</option>
						{#each businesses as biz (biz.id)}
							<option value={biz.id}>{biz.name}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="career-dept">
					<span class="label-text mb-1">Department</span>
					<input
						id="career-dept"
						class="input input-bordered w-full cursor-text"
						bind:value={formDepartmentLabel}
					/>
				</label>
				<label class="form-control w-full" for="career-salary-min">
					<span class="label-text mb-1">Salary min</span>
					<input
						id="career-salary-min"
						type="number"
						min="0"
						class="input input-bordered w-full cursor-text"
						bind:value={formSalaryMin}
					/>
				</label>
				<label class="form-control w-full" for="career-salary-max">
					<span class="label-text mb-1">Salary max</span>
					<input
						id="career-salary-max"
						type="number"
						min="0"
						class="input input-bordered w-full cursor-text"
						bind:value={formSalaryMax}
					/>
				</label>
				<label class="form-control w-full" for="career-currency">
					<span class="label-text mb-1">Currency</span>
					<input
						id="career-currency"
						class="input input-bordered w-full cursor-text"
						maxlength="3"
						bind:value={formSalaryCurrency}
					/>
				</label>
				<label class="form-control w-full" for="career-salary-unit">
					<span class="label-text mb-1">Salary unit</span>
					<select
						id="career-salary-unit"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formSalaryUnit}
					>
						<option value="">None</option>
						{#each SALARY_UNITS as unit (unit)}
							<option value={unit}>{SALARY_UNIT_LABELS[unit]}</option>
						{/each}
					</select>
				</label>
				<label class="form-control w-full" for="career-expires">
					<span class="label-text mb-1">Expires</span>
					<input
						id="career-expires"
						type="date"
						class="input input-bordered w-full cursor-text"
						bind:value={formExpiresAt}
					/>
				</label>
				<label class="form-control w-full" for="career-sort">
					<span class="label-text mb-1">
						Sort order<span class="text-error align-top text-sm leading-none" aria-hidden="true"
							>*</span
						>
					</span>
					<input
						id="career-sort"
						type="number"
						class="input input-bordered w-full cursor-text"
						bind:value={formSortOrder}
						required
					/>
				</label>
				<label class="form-control w-full sm:col-span-2" for="career-status">
					<span class="label-text mb-1">
						Status<span class="text-error align-top text-sm leading-none" aria-hidden="true">*</span>
					</span>
					<select
						id="career-status"
						class="select select-bordered w-full cursor-pointer"
						bind:value={formStatus}
						required
					>
						{#each PUBLISH_STATUSES as status (status)}
							<option value={status}>{PUBLISH_STATUS_LABELS[status]}</option>
						{/each}
					</select>
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
				<button type="submit" class="btn btn-primary cursor-pointer" disabled={saving}>
					{#if saving}<span class="loading loading-spinner loading-sm"></span>{/if}
					Save
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" class="cursor-pointer" onclick={() => (dialogOpen = false)}>close</button>
	</form>
</dialog>

<dialog class="modal" class:modal-open={!!deleteTarget}>
	<div class="modal-box">
		<h2 class="card-title text-error font-bold">Delete job post</h2>
		<p class="py-3">
			Delete <strong>{deleteTarget?.title}</strong>?
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
			<button
				type="button"
				class="btn btn-error cursor-pointer"
				onclick={confirmDelete}
				disabled={deleting}
			>
				{#if deleting}<span class="loading loading-spinner loading-sm"></span>{/if}
				Delete
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" class="cursor-pointer" onclick={() => (deleteTarget = null)}>close</button>
	</form>
</dialog>

<CrudToast message={toastMessage} kind={toastKind} />
