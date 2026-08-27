<script lang="ts">
	import { cn } from '$lib/utils';

	let props = $props();

	let bgStyles =
		'odd:via-outline/10 data-[hover-effect=false]:odd:hover:via-outline/10 hover:via-primary/5 data-[active=true]:via-primary/10 bg-linear-to-r from-transparent to-transparent data-[clickable=true]:cursor-pointer data-[hover-effect=false]:hover:via-transparent';
</script>

<tr class={cn('border-outline border-b last:border-none', props.background && bgStyles)}>
	{@render props?.children()}
</tr>
