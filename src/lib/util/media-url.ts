/** Client-safe media URL helper (no server imports). */
export function toMediaUrl(stored: string | null | undefined): string | null {
	if (!stored) return null;
	if (stored.startsWith('/api/media/')) return stored;
	if (stored.startsWith('members/') || stored.startsWith('partners/')) {
		return `/api/media/${stored.split('/').map(encodeURIComponent).join('/')}`;
	}

	const membersIdx = stored.indexOf('members/');
	const partnersIdx = stored.indexOf('partners/');
	const idx =
		membersIdx >= 0 && partnersIdx >= 0
			? Math.min(membersIdx, partnersIdx)
			: Math.max(membersIdx, partnersIdx);
	if (idx < 0) return stored;

	const key = stored.slice(idx).split('?')[0]!;
	return `/api/media/${key.split('/').map(encodeURIComponent).join('/')}`;
}
