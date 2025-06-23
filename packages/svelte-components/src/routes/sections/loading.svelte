<script>
	import { Cluster, Progress, Stack } from '$lib';
	import Skeleton from '$lib/components/loading/Skeleton.svelte';
</script>

<Stack tag="section" id="loading">
	<h2 class="text-headline">Loading</h2>

	<h3 class="text-title">Progress Indicator</h3>
	<Progress percentage={20} />

	<h3 class="text-title">Skeleton Loader</h3>
	<Cluster>
		<Skeleton />
		<Skeleton />
	</Cluster>
</Stack>
