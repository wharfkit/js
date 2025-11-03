<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { children, ...props }: Props = $props();
</script>

<dt {...props} class={cn('text-muted self-start text-nowrap', props.class)}>
	{@render children()}
</dt>
