<script lang="ts">
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';
</script>

<svelte:head>
	<title>Sign up disabled | MARIESTA</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="card bg-base-100 card-border shadow-sm">
	<div class="card-body gap-4">
		<h1 class="card-title text-primary font-bold">Invite only</h1>
		<p class="text-sm text-base-content/70">
			New accounts are created by invitation. If you already have an account, sign in instead.
		</p>
		<a class="btn btn-primary cursor-pointer" href={AUTH_ROUTES.login}>Go to login</a>
	</div>
</div>
