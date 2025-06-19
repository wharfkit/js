<!-- The Cluster is used for groups of elements that differ in length, 
should be aligned horizontally, and are liable to wrap 
in small screen contexts. E.g. Buttons, Tags, Keywords, etc. -->
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		tag?: string;
		threshold?: string;
	}

	const { tag = 'div', ...props }: Props = $props();
</script>

<svelte:element this={tag} {...props} class={cn('flex flex-wrap  gap-4', props.class)}>
	{@render props.children()}
</svelte:element>
