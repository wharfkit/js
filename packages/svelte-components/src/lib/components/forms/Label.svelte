<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { createLabel, melt } from '@melt-ui/svelte';
	import { cn } from '$lib/utils';

	interface Props extends HTMLLabelAttributes {
		for: string;
		children: Snippet;
	}

	const {
		elements: { root }
	} = createLabel();

	let props: Props = $props();
</script>

<label for={props.for} use:melt={$root} class={cn('text-label', props.class)}>
	{@render props.children()}
</label>
