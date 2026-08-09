export const OTP_LENGTH = 6;
/** Better Auth OTP lifetime (seconds). */
export const OTP_EXPIRES_IN_SEC = 60 * 3;
/** Client + UX cooldown before another resend (seconds). */
export const OTP_RESEND_COOLDOWN_SEC = 60;

export function formatCountdown(totalSeconds: number) {
	const safe = Math.max(0, Math.floor(totalSeconds));
	const minutes = Math.floor(safe / 60);
	const seconds = safe % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
