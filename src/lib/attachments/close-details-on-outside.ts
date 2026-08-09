export function closeDetailsOnOutside() {
	return (details: HTMLDetailsElement) => {
		function onPointerDown(e: PointerEvent) {
			if (!details.open) return;
			if (!details.contains(e.target as Node)) details.open = false;
		}
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape' && details.open) details.open = false;
		}
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	};
}
