<script>
	import { Details, Stack } from '$lib';
</script>

<Stack tag="section" id="expanding">
	<h2 class="text-headline">Expanding Elements</h2>
	<h3 class="text-title">Details Summary</h3>
	<Details>
		{#snippet header()}
			Header (summary)
		{/snippet}

		Content (details)
	</Details>

	<h3 class="text-title">Accordion</h3>
	<p>TODO</p>
</Stack>
