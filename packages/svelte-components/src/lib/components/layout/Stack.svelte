<!-- The Stack component inserts vertical margins -->

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		tag?: string;
		class?: string;
	}

	const props: Props = $props();
</script>

<svelte:element this={props.tag || 'div'} {...props} class={cn('flex flex-col gap-6', props.class)}>
	{@render props.children()}
</svelte:element>
