<!-- The Card is a Box with slots for content and additional styling -->
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		title?: string;
		titleTag?: string;
		children: Snippet;
		tag?: string;
	}

	const { title = '', titleTag = 'h3', tag = 'div', children, ...props }: Props = $props();
</script>

<svelte:element this={tag} {...props} class={cn('bg-surface rounded-xl p-5', props.class)}>
	{#if title}
		<svelte:element this={titleTag} class="text-title pt-1 pb-4">
			{title}
		</svelte:element>
	{/if}
	{@render children()}
</svelte:element>
