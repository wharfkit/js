<script lang="ts">
	import { cn } from '$lib/utils';
	import { Int, Int64 } from '@wharfkit/antelope';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		number: Int | number;
		locale?: Intl.LocalesArgument;
		delta?: boolean;
		colored?: boolean;
		prefixed?: boolean;
		options?: Intl.NumberFormatOptions;
	}

	let {
		delta = false,
		colored = true,
		prefixed = false,
		locale = 'en-US',
		...props
	}: Props = $props();

	const number = $derived(Int64.from(props.number));
	const positive = $derived(number.gt(Int64.from(0)));
	const negative = $derived(number.lt(Int64.from(0)));

	const formattedNumber = (int: Int) =>
		new Intl.NumberFormat(locale, props.options).format(Number(int));

	const symbol = $derived(positive ? '+' : '');
</script>

{#if delta}
	<span
		{...props}
		class:text-success={colored && positive}
		class:text-error={colored && negative}
		class={cn('', props.class)}
	>
		{symbol}{formattedNumber(number)}
	</span>
{:else}
	<span {...props} class={cn('', props.class)}>
		{#if prefixed}{symbol}{/if}{formattedNumber(number)}
	</span>
{/if}
