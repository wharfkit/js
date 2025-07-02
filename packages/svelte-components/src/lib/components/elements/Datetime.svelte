<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export interface DatetimeProps extends HTMLAttributes<HTMLSpanElement> {
		datetime: Date;
		locale?: Intl.LocalesArgument;
		options?: Intl.DateTimeFormatOptions;
	}

	let { datetime, locale = 'en-US', options, ...props }: DatetimeProps = $props();

	const defaultDateOptions: Intl.DateTimeFormatOptions = {
		dateStyle: 'short',
		timeStyle: 'long'
	};
</script>

<span {...props}>
	{new Intl.DateTimeFormat(locale, {
		...defaultDateOptions,
		...options
	}).format(datetime)}
</span>
