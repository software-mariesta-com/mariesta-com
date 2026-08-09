import type { SubmitFunction } from '@sveltejs/kit';

/** SvelteKit `enhance` submit factory that toggles a pending flag around the request. */
export function withFormPending(setPending: (pending: boolean) => void): SubmitFunction {
	return () => {
		setPending(true);
		return async ({ update }) => {
			try {
				await update();
			} finally {
				setPending(false);
			}
		};
	};
}
