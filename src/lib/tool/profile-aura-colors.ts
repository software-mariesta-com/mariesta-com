export type ProfileAuraColors = {
	/** Primary aura tone (maps to `color` / currentColor). */
	tone1: string;
	/** Secondary aura tone (maps to `background-color`). */
	tone2: string;
};

const SAMPLE_SIZE = 32;

function rgbToHsl(r: number, g: number, b: number): [h: number, s: number, l: number] {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	let h = 0;
	let s = 0;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case rn:
				h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
				break;
			case gn:
				h = ((bn - rn) / d + 2) / 6;
				break;
			default:
				h = ((rn - gn) / d + 4) / 6;
				break;
		}
	}

	return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [r: number, g: number, b: number] {
	const sn = s / 100;
	const ln = l / 100;

	if (sn === 0) {
		const gray = Math.round(ln * 255);
		return [gray, gray, gray];
	}

	const hueToRgb = (p: number, q: number, t: number) => {
		let tn = t;
		if (tn < 0) tn += 1;
		if (tn > 1) tn -= 1;
		if (tn < 1 / 6) return p + (q - p) * 6 * tn;
		if (tn < 1 / 2) return q;
		if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
		return p;
	};

	const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
	const p = 2 * ln - q;
	const hn = h / 360;

	return [
		Math.round(hueToRgb(p, q, hn + 1 / 3) * 255),
		Math.round(hueToRgb(p, q, hn) * 255),
		Math.round(hueToRgb(p, q, hn - 1 / 3) * 255)
	];
}

function hslToCss(h: number, s: number, l: number): string {
	const [r, g, b] = hslToRgb(h, s, l);
	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Samples a small canvas of the image, weights saturated pixels more heavily,
 * averages to a dominant RGB, then builds dual aura tones (base + hue-shifted lighter).
 */
export function extractProfileAuraColorsFromImage(img: HTMLImageElement): ProfileAuraColors | null {
	if (!img.complete || img.naturalWidth === 0) return null;

	const canvas = document.createElement('canvas');
	canvas.width = SAMPLE_SIZE;
	canvas.height = SAMPLE_SIZE;

	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return null;

	ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
	const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

	let rSum = 0;
	let gSum = 0;
	let bSum = 0;
	let weightSum = 0;

	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3];
		if (alpha < 128) continue;

		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);

		if (max > 245 && min > 230) continue;
		if (max < 25 && min < 15) continue;

		const [, saturation] = rgbToHsl(r, g, b);
		const weight = saturation * 0.01 + 0.25;

		rSum += r * weight;
		gSum += g * weight;
		bSum += b * weight;
		weightSum += weight;
	}

	if (weightSum === 0) return null;

	const avgR = Math.round(rSum / weightSum);
	const avgG = Math.round(gSum / weightSum);
	const avgB = Math.round(bSum / weightSum);
	const [h, s, l] = rgbToHsl(avgR, avgG, avgB);

	return {
		tone1: hslToCss(h, Math.min(100, s * 1.05), Math.min(62, Math.max(34, l))),
		tone2: hslToCss((h + 32) % 360, Math.min(88, s * 0.9), Math.min(76, l + 16))
	};
}

/** Loads an image URL and returns dual aura tones, or null on failure / CORS. */
export function loadProfileAuraColors(src: string): Promise<ProfileAuraColors | null> {
	if (typeof document === 'undefined') return Promise.resolve(null);

	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';

		img.onload = () => {
			try {
				resolve(extractProfileAuraColorsFromImage(img));
			} catch {
				resolve(null);
			}
		};

		img.onerror = () => resolve(null);
		img.src = src;
	});
}
