<script>
	import { cn } from '$lib/utils';

	let props = $props();
</script>

<td class={cn('text-body text-on-surface py-3 pr-2 pl-2 first:pl-0 last:pr-0', props.class)}>
	{@render props?.children()}
</td>
