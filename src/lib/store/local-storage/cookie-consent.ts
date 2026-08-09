export const CONSENT_STORAGE_KEY = 'mariesta-cookie-consent';
/** Bump when categories change so visitors are re-prompted. */
export const CONSENT_VERSION = 1;

export type CookieConsent = {
	version: number;
	essential: true;
	preferences: boolean;
	analytics: boolean;
	updatedAt: string;
};

type ConsentListener = () => void;

const listeners = new Set<ConsentListener>();
let openSettingsRequested = false;

function notify() {
	for (const listener of listeners) listener();
}

export function subscribeConsent(listener: ConsentListener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function readConsent(): CookieConsent | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<CookieConsent>;
		if (parsed.version !== CONSENT_VERSION) return null;
		if (typeof parsed.preferences !== 'boolean' || typeof parsed.analytics !== 'boolean') {
			return null;
		}
		return {
			version: CONSENT_VERSION,
			essential: true,
			preferences: parsed.preferences,
			analytics: parsed.analytics,
			updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
		};
	} catch {
		return null;
	}
}

export function hasConsentRecord(): boolean {
	return readConsent() !== null;
}

export function hasPreferencesConsent(): boolean {
	return readConsent()?.preferences === true;
}

export function hasAnalyticsConsent(): boolean {
	return readConsent()?.analytics === true;
}

/** Call before loading analytics scripts. Safe when consent is missing (returns false). */
export function canLoadAnalytics(): boolean {
	return hasAnalyticsConsent();
}

function writeConsent(consent: CookieConsent) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
	} catch {
		/* ignore quota / private mode */
	}
	notify();
}

function clearPreferenceStorage() {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem('mariesta-theme');
	} catch {
		/* ignore */
	}
	if (typeof document !== 'undefined') {
		document.cookie = 'PARAGLIDE_LOCALE=; Max-Age=0; Path=/; SameSite=Lax';
	}
}

export function saveConsent(input: { preferences: boolean; analytics: boolean }): CookieConsent {
	const consent: CookieConsent = {
		version: CONSENT_VERSION,
		essential: true,
		preferences: input.preferences,
		analytics: input.analytics,
		updatedAt: new Date().toISOString()
	};
	writeConsent(consent);
	if (!consent.preferences) {
		clearPreferenceStorage();
	}
	return consent;
}

export function acceptAllConsent(): CookieConsent {
	return saveConsent({ preferences: true, analytics: true });
}

export function rejectNonEssentialConsent(): CookieConsent {
	return saveConsent({ preferences: false, analytics: false });
}

/** Footer / policy: ask CookieConsent UI to open the customize panel. */
export function openCookieSettings() {
	openSettingsRequested = true;
	notify();
}

export function consumeOpenCookieSettingsRequest(): boolean {
	if (!openSettingsRequested) return false;
	openSettingsRequested = false;
	return true;
}
