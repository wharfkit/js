<script lang="ts">
	import type { Int } from '@wharfkit/antelope';
	import Box from '@lucide/svelte/icons/box';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	export interface BlockProps extends HTMLAnchorAttributes {
		href: string;
		number?: Int | number | string;
		icon?: boolean;
	}

	let { number, href, icon, ...props }: BlockProps = $props();
</script>

{#if number}
	<a
		{href}
		{...props}
		class={cn('text-primary hover:text-primary-hover inline-flex items-center gap-2', props.class)}
	>
		{#if icon}
			<Box class="size-4" />
		{/if}
		{String(number)}
	</a>
{/if}
