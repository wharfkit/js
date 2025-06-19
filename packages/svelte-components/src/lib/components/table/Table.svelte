<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		thead?: Snippet;
		colgroup?: Snippet;
		children: Snippet;
		class?: string;
		fixed?: boolean;
		full?: boolean;
	}

	let props: Props = $props();
</script>

<table
	class:w-full={props.full}
	class:table-fixed={props.fixed}
	class={cn('overflow-x-auto', props.class)}
>
	{#if props.colgroup}
		<colgroup>
			{@render props.colgroup()}
		</colgroup>
	{/if}

	{#if props.thead}
		<thead>
			<tr>
				{@render props.thead()}
			</tr>
		</thead>
	{/if}

	<tbody>
		{@render props.children()}
	</tbody>
</table>
