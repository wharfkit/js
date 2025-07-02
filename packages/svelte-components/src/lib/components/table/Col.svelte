<script lang="ts">
	import { cn } from '$lib/utils';

	export interface ColProps {
		span?: number;
		class?: string;
	}

	let props: ColProps = $props();
</script>

<col span={props.span} class={cn('', props.class)} />
