export type AppTheme = 'winter' | 'night';
export type ThemePreference = AppTheme | 'system';

export const THEME_STORAGE_KEY = 'mariesta-theme';
export const FAVICON_LIGHT = '/favicon-light.svg';
export const FAVICON_NIGHT = '/favicon-night.svg';

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
	return value === 'winter' || value === 'night' || value === 'system';
}

export function isAppTheme(value: string | null | undefined): value is AppTheme {
	return value === 'winter' || value === 'night';
}

export function readStoredPreference(): ThemePreference | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY);
		return isThemePreference(value) ? value : null;
	} catch {
		return null;
	}
}

export function systemTheme(): AppTheme {
	if (typeof window === 'undefined') return 'winter';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'winter';
}

/** Resolve preference → actual daisyUI theme on `<html>`. */
export function resolveEffectiveTheme(preference: ThemePreference = readStoredPreference() ?? 'system'): AppTheme {
	return preference === 'system' ? systemTheme() : preference;
}

export function syncFavicon(effective: AppTheme = resolveEffectiveTheme()) {
	if (typeof document === 'undefined') return;
	const href = effective === 'night' ? FAVICON_NIGHT : FAVICON_LIGHT;
	let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-mariesta-favicon]');
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		link.type = 'image/svg+xml';
		link.dataset.mariestaFavicon = 'true';
		document.head.appendChild(link);
	}
	if (link.getAttribute('href') !== href) {
		link.href = href;
	}
}

export function applyThemePreference(
	preference: ThemePreference,
	options: { syncFavicon?: boolean } = {}
) {
	if (typeof document === 'undefined') return resolveEffectiveTheme(preference);
	const effective = resolveEffectiveTheme(preference);
	document.documentElement.setAttribute('data-theme', effective);
	document.documentElement.dataset.themePreference = preference;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, preference);
	} catch {
		/* ignore quota / private mode */
	}
	if (options.syncFavicon !== false) {
		syncFavicon(effective);
	}
	return effective;
}

/** @deprecated Prefer applyThemePreference */
export function applyTheme(theme: AppTheme) {
	applyThemePreference(theme);
}

export function resolveTheme(): ThemePreference {
	return readStoredPreference() ?? 'system';
}

type ThemeOrigin = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> | { x: number; y: number };

function originPoint(origin: ThemeOrigin): { x: number; y: number } {
	if ('x' in origin && 'y' in origin && !('left' in origin)) {
		return { x: origin.x, y: origin.y };
	}
	const box = origin as DOMRect;
	return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function endRadius(x: number, y: number) {
	return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
}

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spawnThemeRings(x: number, y: number) {
	const host = document.createElement('div');
	host.className = 'theme-transition-rings';
	host.style.setProperty('--theme-tx', `${x}px`);
	host.style.setProperty('--theme-ty', `${y}px`);
	host.setAttribute('aria-hidden', 'true');
	host.innerHTML =
		'<span class="theme-ring theme-ring-inner"></span><span class="theme-ring theme-ring-outer"></span>';
	document.body.appendChild(host);

	const remove = () => host.remove();
	host.addEventListener('animationend', remove, { once: true });
	window.setTimeout(remove, 900);
}

/**
 * Set Light / Dark / System with a circular wipe from the theme control when the
 * effective theme actually changes. Favicon follows the website effective theme.
 */
export async function setThemePreferenceWithCircleTransition(
	preference: ThemePreference,
	origin: ThemeOrigin,
	currentEffective: AppTheme = resolveEffectiveTheme()
): Promise<{ preference: ThemePreference; effective: AppTheme }> {
	const nextEffective = resolveEffectiveTheme(preference);
	const { x, y } = originPoint(origin);

	if (
		nextEffective === currentEffective ||
		prefersReducedMotion() ||
		typeof document.startViewTransition !== 'function'
	) {
		const effective = applyThemePreference(preference);
		return { preference, effective };
	}

	const root = document.documentElement;
	root.dataset.themeTransition = 'circle';
	spawnThemeRings(x, y);

	const transition = document.startViewTransition(() => {
		// Defer favicon until after the wipe so the tab icon swap does not flash mid-transition
		applyThemePreference(preference, { syncFavicon: false });
	});

	try {
		await transition.ready;

		const radius = endRadius(x, y);
		// Always expand the NEW theme from the button (same path for light and dark).
		// Reversing clip on the old root caused a refresh-like glitch when going to light.
		root.animate(
			{
				clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]
			},
			{
				duration: 620,
				easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
				pseudoElement: '::view-transition-new(root)'
			}
		);

		await transition.finished;
	} catch {
		applyThemePreference(preference, { syncFavicon: false });
	} finally {
		delete root.dataset.themeTransition;
		syncFavicon(nextEffective);
	}

	return { preference, effective: nextEffective };
}

/** Keep System preference in sync when OS theme changes. */
export function watchSystemTheme(onChange: (effective: AppTheme) => void): () => void {
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = () => {
		const preference = readStoredPreference() ?? 'system';
		if (preference !== 'system') return;
		const effective = applyThemePreference('system');
		onChange(effective);
	};
	mq.addEventListener('change', handler);
	return () => mq.removeEventListener('change', handler);
}
