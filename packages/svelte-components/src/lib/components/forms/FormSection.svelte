<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface FormSectionProps {
		children: Snippet;
	}
	let props: FormSectionProps = $props();
</script>

<section class="subgrid gap-8 @3xl:gap-12">
	{@render props.children()}
</section>
