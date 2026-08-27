<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { children, ...props }: Props = $props();
</script>

<dd {...props} class={cn('grow text-right text-balance break-all tabular-nums', props.class)}>
	{@render children()}
</dd>
