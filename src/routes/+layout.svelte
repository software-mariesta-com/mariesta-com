<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';

	let { children } = $props();
</script>

{@render children()}
