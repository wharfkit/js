<script lang="ts">
	import { cn } from '$lib/utils';
	import { type AnyMeltElement, melt } from '@melt-ui/svelte';
	import { type Snippet } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	export interface SelectMenuProps {
		variant: 'pill' | 'form';
		id: string;
		children: Snippet;
		open: Readable<boolean>;
		menu: AnyMeltElement;
		class?: string;
	}

	const { class: className, menu, open, ...props }: SelectMenuProps = $props();
</script>

{#if $open}
	<!-- Might need to pass data-theme if we can't inherit -->
	<!-- data-theme={context.network} -->
	<div
		data-variant={props.variant}
		class={cn(
			'border-outline bg-surface-container z-90 flex max-h-[300px] flex-col overflow-y-auto border-2 py-1 shadow-sm focus:ring-0! data-[variant=form]:rounded-lg data-[variant=form]:px-2 data-[variant=form]:py-2 data-[variant=pill]:rounded-2xl data-[variant=pill]:px-1 data-[variant=pill]:py-1 ',
			className
		)}
		use:melt={$menu}
		transition:fade={{ duration: 100 }}
	>
		{@render props.children()}
	</div>
{/if}
