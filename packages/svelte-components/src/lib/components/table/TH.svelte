<script>
	import { cn } from '$lib/utils';

	let props = $props();
</script>

<th
	class={cn('text-muted text-label py-1.5 pr-2 pl-2 text-left first:pl-0 last:pr-0', props.class)}
>
	{@render props?.children()}
</th>
