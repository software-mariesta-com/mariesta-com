<script lang="ts">
	import { onMount } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import Languages from '@lucide/svelte/icons/languages';
	import Menu from '@lucide/svelte/icons/menu';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Moon from '@lucide/svelte/icons/moon';
	import Palette from '@lucide/svelte/icons/palette';
	import Sun from '@lucide/svelte/icons/sun';
	import { closeDetailsOnOutside } from '#lib/attachments/close-details-on-outside';
	import {
		nav_about,
		nav_businesses,
		nav_career,
		nav_home,
		nav_language,
		nav_partners,
		nav_theme,
		nav_theme_dark,
		nav_theme_light,
		nav_theme_system
	} from '#lib/paraglide/messages';
	import { getLocale, localizeHref, setLocale, type Locale } from '#lib/paraglide/runtime';
	import {
		applyThemePreference,
		resolveTheme,
		setThemePreferenceWithCircleTransition,
		watchSystemTheme,
		type AppTheme,
		type ThemePreference
	} from '#lib/store/local-storage/theme';

	const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
		{ value: 'en', label: 'English' },
		{ value: 'my', label: 'Myanmar' }
	];

	const THEME_OPTIONS: {
		value: ThemePreference;
		label: () => string;
		icon: typeof Sun;
	}[] = [
		{ value: 'system', label: () => nav_theme_system(), icon: Monitor },
		{ value: 'winter', label: () => nav_theme_light(), icon: Sun },
		{ value: 'night', label: () => nav_theme_dark(), icon: Moon }
	];

	const NAV_LINKS: { href: string | null; hash: string | null; label: () => string }[] = [
		{ href: null, hash: null, label: () => nav_home() },
		{ href: '/about', hash: null, label: () => nav_about() },
		{ href: '/companies', hash: null, label: () => nav_businesses() },
		{ href: null, hash: 'partners', label: () => nav_partners() },
		{ href: '/careers', hash: null, label: () => nav_career() }
	];

	let menuOpen = $state(false);
	let langOpen = $state(false);
	let themeOpen = $state(false);
	let currentLocale = $state<Locale>(getLocale());
	let themePreference = $state<ThemePreference>('system');
	let effectiveTheme = $state<AppTheme>('winter');
	let themeBusy = $state(false);
	let themeBtnEl: HTMLElement | undefined = $state();

	const homeHref = $derived(localizeHref('/home'));

	function navHref(link: { href: string | null; hash: string | null }) {
		if (link.href) return localizeHref(link.href);
		return link.hash ? `${homeHref}#${link.hash}` : homeHref;
	}

	onMount(() => {
		themePreference = resolveTheme();
		effectiveTheme = applyThemePreference(themePreference);
		return watchSystemTheme((effective) => {
			effectiveTheme = effective;
		});
	});

	function chooseLocale(locale: Locale) {
		currentLocale = locale;
		langOpen = false;
		setLocale(locale);
	}

	async function chooseTheme(preference: ThemePreference) {
		if (themeBusy || preference === themePreference) {
			themeOpen = false;
			return;
		}
		themeBusy = true;
		themeOpen = false;
		try {
			const origin = themeBtnEl?.getBoundingClientRect() ?? {
				x: window.innerWidth - 72,
				y: 28
			};
			const result = await setThemePreferenceWithCircleTransition(
				preference,
				origin,
				effectiveTheme
			);
			themePreference = result.preference;
			effectiveTheme = result.effective;
		} finally {
			themeBusy = false;
		}
	}
</script>

<div class="navbar bg-base-200 shadow-sm">
	<div class="navbar-start">
		<div class="tooltip tooltip-bottom" data-tip="Menu">
			<details
				class="dropdown"
				bind:open={menuOpen}
				{@attach closeDetailsOnOutside()}
			>
				<summary
					class="btn btn-ghost btn-square lg:hidden cursor-pointer [&::-webkit-details-marker]:hidden"
					aria-label="Menu"
					aria-expanded={menuOpen}
				>
					<Menu class="h-5 w-5" />
				</summary>
				<ul
					tabindex="-1"
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
				>
					{#each NAV_LINKS as link (link.href ?? link.hash ?? 'home')}
						<li>
							<a
								href={navHref(link)}
								class="cursor-pointer"
								onclick={() => (menuOpen = false)}
							>
								{link.label()}
							</a>
						</li>
					{/each}
				</ul>
			</details>
		</div>
		<a
			href={homeHref}
			class="btn btn-ghost logo-wordmark cursor-pointer items-center text-xl leading-none"
		>
			<span class="relative top-[0.12em]">MARIESTA</span>
		</a>
	</div>

	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			{#each NAV_LINKS as link (link.href ?? link.hash ?? 'home')}
				<li>
					<a href={navHref(link)} class="cursor-pointer">{link.label()}</a>
				</li>
			{/each}
		</ul>
	</div>

	<div class="navbar-end gap-1">
		<div class="tooltip tooltip-left" data-tip={nav_theme()}>
			<details
				class="dropdown dropdown-end"
				bind:open={themeOpen}
				{@attach closeDetailsOnOutside()}
			>
				<summary
					bind:this={themeBtnEl}
					class="btn btn-ghost btn-square [&::-webkit-details-marker]:hidden {themeBusy
						? 'cursor-wait'
						: 'cursor-pointer'}"
					aria-label={nav_theme()}
					aria-expanded={themeOpen}
					aria-disabled={themeBusy}
				>
					<Palette class="h-5 w-5" aria-hidden="true" />
				</summary>
				<ul
					tabindex="-1"
					class="menu menu-sm dropdown-content bg-base-100 border-base-300 rounded-box z-50 mt-1 w-48 border p-2 shadow-lg"
				>
					{#each THEME_OPTIONS as option (option.value)}
						{@const Icon = option.icon}
						<li>
							<button
								type="button"
								class="justify-between cursor-pointer"
								class:menu-active={themePreference === option.value}
								disabled={themeBusy}
								onclick={() => chooseTheme(option.value)}
							>
								<span class="flex items-center gap-2">
									<Icon class="h-4 w-4 shrink-0" aria-hidden="true" />
									{option.label()}
								</span>
								{#if themePreference === option.value}
									<Check class="text-success h-4 w-4 shrink-0" aria-hidden="true" />
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</details>
		</div>

		<div class="tooltip tooltip-left" data-tip={nav_language()}>
			<details class="dropdown dropdown-end" bind:open={langOpen} {@attach closeDetailsOnOutside()}>
				<summary
					class="btn btn-ghost btn-square cursor-pointer [&::-webkit-details-marker]:hidden"
					aria-label={nav_language()}
					aria-expanded={langOpen}
				>
					<Languages class="h-5 w-5" />
				</summary>
				<ul
					tabindex="-1"
					class="menu menu-sm dropdown-content bg-base-100 border-base-300 rounded-box z-50 mt-1 w-44 border p-2 shadow-lg"
				>
					{#each LANGUAGE_OPTIONS as option (option.value)}
						<li>
							<button
								type="button"
								class="justify-between cursor-pointer"
								class:menu-active={currentLocale === option.value}
								onclick={() => chooseLocale(option.value)}
							>
								<span>{option.label}</span>
								{#if currentLocale === option.value}
									<Check class="text-success h-4 w-4 shrink-0" aria-hidden="true" />
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</details>
		</div>
	</div>
</div>
