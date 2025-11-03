<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dlrow from './DLRow.svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type DescriptionItem = {
		title: string;
		description: string;
	};

	export interface DLProps extends HTMLAttributes<HTMLDListElement> {
		items?: DescriptionItem[];
		children?: Snippet;
	}

	let { items, children, ...props }: DLProps = $props();
</script>

<dl {...props} class={cn('@container', props.class)}>
	{#if items}
		{#each items as { title, description }, index (index)}
			<Dlrow {title} {description} />
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</dl>
