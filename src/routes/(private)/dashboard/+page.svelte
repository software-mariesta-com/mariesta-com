<script lang="ts">
	import Activity from '@lucide/svelte/icons/activity';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Users from '@lucide/svelte/icons/users';
	import type { LayoutServerData } from '../$types';

	let { data }: { data: LayoutServerData } = $props();
</script>

<svelte:head>
	<title>Dashboard | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold text-base-content sm:text-3xl">Dashboard</h1>
		<p class="mt-1 text-sm text-base-content/70">
			Welcome back, {data.user.name}.
		</p>
	</div>

	<div class="stats stats-vertical w-full bg-base-100 shadow-sm lg:stats-horizontal">
		<div class="stat">
			<div class="stat-figure text-primary">
				<Building2 class="h-8 w-8" aria-hidden="true" />
			</div>
			<div class="stat-title">Businesses</div>
			<div class="stat-value text-primary">12</div>
			<div class="stat-desc">Placeholder group companies</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-secondary">
				<Users class="h-8 w-8" aria-hidden="true" />
			</div>
			<div class="stat-title">Members</div>
			<div class="stat-value">248</div>
			<div class="stat-desc">Placeholder community size</div>
		</div>

		<div class="stat">
			<div class="stat-figure text-accent">
				<Activity class="h-8 w-8" aria-hidden="true" />
			</div>
			<div class="stat-title">Active today</div>
			<div class="stat-value">36</div>
			<div class="stat-desc">Placeholder activity</div>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<section class="rounded-box border border-base-300 bg-base-100 p-5">
			<h2 class="text-lg font-bold text-base-content">Getting started</h2>
			<p class="mt-2 text-sm text-base-content/70">
				Manage businesses, facilities, departments, members, and partners from the sidebar. Publish
				items to show them on the public home page.
			</p>
			<ul class="mt-4 list-inside list-disc space-y-1 text-sm text-base-content/80">
				<li>Session guard is active on all private routes</li>
				<li>Use Profile for account security and logout</li>
				<li>Set status to Published for home page visibility</li>
			</ul>
		</section>

		<section class="rounded-box border border-base-300 bg-base-100 p-5">
			<h2 class="text-lg font-bold text-base-content">Signed-in account</h2>
			<dl class="mt-3 grid gap-2 text-sm">
				<div class="flex justify-between gap-4 border-b border-base-300 py-2">
					<dt class="text-base-content/60">Name</dt>
					<dd class="font-medium">{data.user.name}</dd>
				</div>
				<div class="flex justify-between gap-4 border-b border-base-300 py-2">
					<dt class="text-base-content/60">Email</dt>
					<dd class="font-medium">{data.user.email}</dd>
				</div>
				<div class="flex justify-between gap-4 py-2">
					<dt class="text-base-content/60">User ID</dt>
					<dd class="max-w-[60%] truncate font-mono text-xs">{data.user.id}</dd>
				</div>
			</dl>
		</section>
	</div>
</div>
