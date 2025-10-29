<script lang="ts">
	import type { Snippet } from 'svelte';
	import DT from './DT.svelte';
	import DD from './DD.svelte';
	import { cn } from '$lib/utils';

	export interface DLRowProps {
		title: string | Snippet;
		description?: string;
		class?: string;
		children?: Snippet;
	}

	let { title = '', description, children, ...props }: DLRowProps = $props();
</script>

<div
	class={cn(
		'border-outline flex flex-wrap items-center justify-between gap-x-4 border-b py-3 last:border-none @xs:flex-nowrap',
		"bg-error-container grow before:content-['ERROR_Missing_DT_element_'] has-[dt]:bg-transparent has-[dt]:before:hidden",
		props.class
	)}
>
	{#if typeof title === 'string'}
		<DT>
			{title}
		</DT>
	{:else}
		{@render title()}
	{/if}
	<div
		class="bg-error-container grow before:content-['ERROR_Missing_DD_element_'] has-[dd]:bg-transparent has-[dd]:before:hidden"
	>
		{#if description}
			<DD>{description}</DD>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
