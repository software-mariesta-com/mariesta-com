/** Simple process-local TTL cache for hot public reads (footer, etc.). */

type CacheEntry<T> = {
	value: T;
	expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

export function ttlGet<T>(key: string): T | undefined {
	const entry = store.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expiresAt) {
		store.delete(key);
		return undefined;
	}
	return entry.value as T;
}

export function ttlSet<T>(key: string, value: T, ttlMs: number): void {
	store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function ttlInvalidate(key: string): void {
	store.delete(key);
}
