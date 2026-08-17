export const USER_TIERS = ['starter'] as const;
export type UserTier = (typeof USER_TIERS)[number];

export const DEFAULT_USER_TIER: UserTier = 'starter';

export const USER_TIER_LABELS: Record<UserTier, { name: string; badge: string }> = {
	starter: { name: 'Starter', badge: 'Free' }
};

export function normalizeUserTier(value: unknown): UserTier {
	if (typeof value === 'string' && (USER_TIERS as readonly string[]).includes(value)) {
		return value as UserTier;
	}
	return DEFAULT_USER_TIER;
}

export function userTierLabel(tier: UserTier) {
	return USER_TIER_LABELS[tier];
}

/** Free tiers that cannot enable developer mode (starter is the default free tier). */
export function isFreeUserTier(tier: unknown): boolean {
	if (typeof tier !== 'string') return true;
	const slug = tier.trim().toLowerCase();
	return slug === 'starter' || slug === 'free';
}
