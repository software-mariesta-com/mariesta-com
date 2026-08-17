/** UI placeholder until Menzies / billing sync provides real purchase history. */
export type PurchasePlanRecord = {
	id: string;
	name: string;
	source: string;
	purchasedAt: string;
	status: 'active' | 'expired' | 'cancelled';
};

/** Demo rows for profile purchase list (replace with API/DB later). */
export const DEMO_PURCHASE_PLANS: PurchasePlanRecord[] = [
	{
		id: 'menzies-workspace',
		name: 'Menzies Workspace',
		source: 'Menzies',
		purchasedAt: 'Aug 1, 2026',
		status: 'active'
	},
	{
		id: 'menzies-analytics',
		name: 'Menzies Analytics',
		source: 'Menzies',
		purchasedAt: 'Jul 12, 2026',
		status: 'active'
	},
	{
		id: 'menzies-collab',
		name: 'Menzies Team Collab',
		source: 'Menzies',
		purchasedAt: 'Jun 3, 2026',
		status: 'expired'
	},
	{
		id: 'menzies-storage',
		name: 'Menzies Extra Storage',
		source: 'Menzies',
		purchasedAt: 'May 18, 2026',
		status: 'cancelled'
	}
];

export function purchasePlanStatusLabel(status: PurchasePlanRecord['status']): string {
	switch (status) {
		case 'active':
			return 'Active';
		case 'expired':
			return 'Expired';
		case 'cancelled':
			return 'Cancelled';
	}
}

export function purchasePlanStatusBadgeClass(status: PurchasePlanRecord['status']): string {
	switch (status) {
		case 'active':
			return 'badge-success badge-outline';
		case 'expired':
			return 'badge-ghost';
		case 'cancelled':
			return 'badge-warning badge-outline';
	}
}
