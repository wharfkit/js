<script lang="ts">
	import type { Asset } from '@wharfkit/antelope';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import Big from 'big.js';

	interface AssetProps extends HTMLAttributes<HTMLSpanElement> {
		locale?: Intl.LocalesArgument;
		value?: Asset;
		variant?: 'value' | 'full' | 'short';
		fallback?: number;
		increasedPrecision?: boolean;
	}

	let {
		value: asset,
		variant = 'value',
		locale = 'en-US',
		fallback = 0,
		...props
	}: AssetProps = $props();

	// TODO: Move somewhere else.
	const SUPPORTED_CURRENCIES = ['USD'];

	const assetOptions: Intl.NumberFormatOptions = {
		minimumFractionDigits: asset?.symbol.precision
	};

	const currencyOptions: Intl.NumberFormatOptions = {
		style: 'currency',
		currency: asset?.symbol.name,
		currencyDisplay: 'narrowSymbol',
		minimumFractionDigits: props.increasedPrecision ? asset?.symbol.precision : 2
	};

	function abbreviatedValue(): string {
		const suffixes = ['', 'K', 'M', 'B', 'T'];
		let suffixIndex = 0;

		if (!asset) {
			return '';
		}

		let value = asset.value;
		while (value >= 1000 && suffixIndex < suffixes.length - 1) {
			value /= 1000;
			suffixIndex++;
		}

		return `${value.toFixed(2)}${suffixes[suffixIndex]} ${asset.symbol.name}`;
	}

	function formatAssetValue() {
		// Use Big.js to accurately convert the string into a usable number
		// Some precision may be lost in extreme circumstances
		const number = Number(new Big(asset?.quantity || fallback));
		return Intl.NumberFormat(locale, assetOptions).format(number);
	}

	function formatCurrencyValue() {
		return Intl.NumberFormat(locale, currencyOptions).format(asset?.value || fallback);
	}

	const isCurrency = SUPPORTED_CURRENCIES.includes(String(asset?.symbol.name));
</script>

{#snippet span(string: string)}
	<span {...props} class={cn('text-nowrap tabular-nums', props.class)}>{string}</span>
{/snippet}

{#if variant === 'short'}
	{@render span(abbreviatedValue())}
{:else if isCurrency && variant === 'value'}
	{@render span(formatCurrencyValue())}
{:else if isCurrency && variant === 'full'}
	{@render span(`${formatCurrencyValue()} ${asset?.symbol.name}`)}
{:else if !isCurrency && variant === 'value'}
	{@render span(formatAssetValue())}
{:else if !isCurrency && variant === 'full'}
	{@render span(`${formatAssetValue()} ${asset?.symbol.name}`)}
{/if}
