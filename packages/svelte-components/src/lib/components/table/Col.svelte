<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		span?: number;
		class?: string;
	}

	let props: Props = $props();
</script>

<col span={props.span} class={cn('', props.class)} />
