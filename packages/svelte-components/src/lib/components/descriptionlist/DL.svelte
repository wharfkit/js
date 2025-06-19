<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dlrow from './DLRow.svelte';
	import { cn } from '$lib/utils';

	type DescriptionItem = {
		title: string;
		description: string;
	};

	interface Props {
		items?: DescriptionItem[];
		children?: Snippet;
		class?: string;
	}

	let props: Props = $props();
</script>

<dl class={cn('@container', props.class)}>
	{#if props.items}
		{#each props.items as { title, description }, index (index)}
			<Dlrow {title} {description} />
		{/each}
	{:else if props.children}
		{@render props.children()}
	{/if}
</dl>
