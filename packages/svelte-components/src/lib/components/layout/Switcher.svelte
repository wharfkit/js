<!-- The Switcher switches a flexbox context between horizontal and a vertical layout
at a given, parent container-based breakpoint. If the breakpoint is 30rem the layout 
will switch to vertical when the parent is less than 30rem wide. 
Useful when all elements inside the switcher are considered equal. -->

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		tag?: string;
		children: Snippet;
		threshold?: string;
	}

	const {
		tag = 'div',
		class: className = '',
		children,
		threshold = '30rem',
		...props
	}: Props = $props();
</script>

<svelte:element
	this={tag}
	{...props}
	data-threshold={threshold}
	style={`--switcher-threshold: ${threshold}`}
	class={cn(
		'flex flex-wrap items-center gap-4 *:grow *:basis-[calc((var(--switcher-threshold)-100%)*999)]',
		className
	)}
>
	{@render children()}
</svelte:element>
