/**
 * Format a Date for CRUD table cells (short, no seconds).
 * Example: `Aug 1, 16:02`
 */
export function formatShortDateTime(value: Date | string | null | undefined): string {
	if (!value) return '-';
	const date = typeof value === 'string' ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return '-';

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	})
		.format(date)
		.replace(',', '');
}
