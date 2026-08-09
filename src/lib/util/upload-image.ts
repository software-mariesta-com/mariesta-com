/** Upload an image to Tigris via the private uploads API. */
export async function uploadImage(
	file: File,
	folder: 'partners' | 'members'
): Promise<{ url: string; key: string }> {
	const body = new FormData();
	body.set('file', file);
	body.set('folder', folder);

	const res = await fetch('/api/uploads', {
		method: 'POST',
		body
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || 'Upload failed');
	}

	return res.json();
}
