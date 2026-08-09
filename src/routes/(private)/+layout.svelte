<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Factory from '@lucide/svelte/icons/factory';
	import Globe from '@lucide/svelte/icons/globe';
	import Handshake from '@lucide/svelte/icons/handshake';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Menu from '@lucide/svelte/icons/menu';
	import Network from '@lucide/svelte/icons/network';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import Users from '@lucide/svelte/icons/users';
	import UserCog from '@lucide/svelte/icons/user-cog';
	import UserRound from '@lucide/svelte/icons/user-round';
	import { ADMIN_ROUTES } from '#lib/constants/admin-routes';
	import { APP_VERSION } from '#lib/constants/app';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
	import type { PermissionSection } from '#lib/constants/permissions';
	import NavProgress from '#lib/components/NavProgress.svelte';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: Snippet } = $props();

	const navItems: {
		href: string;
		label: string;
		icon: typeof LayoutDashboard;
		section: PermissionSection;
	}[] = [
		{ href: ADMIN_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
		{ href: ADMIN_ROUTES.businesses, label: 'Businesses', icon: Building2, section: 'businesses' },
		{ href: ADMIN_ROUTES.facilities, label: 'Facilities', icon: Factory, section: 'facilities' },
		{ href: ADMIN_ROUTES.departments, label: 'Departments', icon: Network, section: 'departments' },
		{ href: ADMIN_ROUTES.members, label: 'Members', icon: Users, section: 'members' },
		{ href: ADMIN_ROUTES.partners, label: 'Partners', icon: Handshake, section: 'partners' },
		{ href: ADMIN_ROUTES.careers, label: 'Careers', icon: Briefcase, section: 'careers' },
		{ href: ADMIN_ROUTES.users, label: 'Users', icon: UserCog, section: 'users' }
	];

	const visibleNav = $derived(
		navItems.filter((item) => data.capabilities[item.section]?.view)
	);

	const show2faBanner = $derived(!data.twoFactorEnabled);

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<div class="drawer lg:drawer-open">
	<NavProgress />
	<input id="admin-drawer" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content relative min-h-svh bg-base-200">
		<div
			class="border-base-300 sticky top-0 z-20 flex items-center gap-2 border-b bg-base-200 px-3 py-2 lg:hidden"
		>
			<div class="tooltip tooltip-bottom" data-tip="Open menu">
				<label
					for="admin-drawer"
					class="btn btn-ghost btn-square cursor-pointer"
					aria-label="Open menu"
				>
					<Menu class="h-5 w-5" />
				</label>
			</div>
		</div>

		<main class="min-h-svh p-4 sm:p-6 lg:p-8">
			{#if show2faBanner && page.url.pathname !== AUTH_ROUTES.profile}
				<div class="alert alert-warning mb-4 shrink-0 shadow-sm" role="status">
					<ShieldAlert class="h-5 w-5 shrink-0" aria-hidden="true" />
					<span>
						Enable two-factor authentication in
						<a class="link font-medium cursor-pointer" href={AUTH_ROUTES.profile}>Profile</a>
						before creating, editing, or deleting records.
					</span>
				</div>
			{/if}
			{@render children()}
		</main>
	</div>

	<div class="drawer-side z-40">
		<label for="admin-drawer" class="drawer-overlay cursor-pointer" aria-label="Close menu"></label>

		<aside class="bg-base-100 flex h-svh w-72 flex-col text-base-content">
			<header
				class="border-base-300 flex shrink-0 items-baseline justify-between gap-3 border-b px-5 py-4"
			>
				<a href={AUTH_ROUTES.dashboard} class="logo-wordmark cursor-pointer text-2xl">MARIESTA</a>
				<span class="text-base-content/50 text-xs tabular-nums">v{APP_VERSION}</span>
			</header>

			<nav class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
				<ul class="menu w-full gap-1 p-0">
					{#each visibleNav as item (item.href)}
						<li>
							<a
								href={item.href}
								class={['cursor-pointer', isActive(item.href) && 'menu-active']}
							>
								<item.icon class="h-4 w-4" aria-hidden="true" />
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<footer class="border-base-300 shrink-0 border-t p-3">
				<ul class="menu w-full gap-1 p-0">
					<li>
						<a href="/home" class="cursor-pointer">
							<Globe class="h-4 w-4" aria-hidden="true" />
							View website
						</a>
					</li>
					<li>
						<a
							href={AUTH_ROUTES.profile}
							class={['cursor-pointer', isActive(AUTH_ROUTES.profile) && 'menu-active']}
						>
							<UserRound class="h-4 w-4" aria-hidden="true" />
							Profile
						</a>
					</li>
				</ul>
			</footer>
		</aside>
	</div>
</div>
