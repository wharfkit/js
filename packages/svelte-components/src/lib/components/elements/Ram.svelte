<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { type Int } from '@wharfkit/antelope';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		bytes?: Int | number;
	}

	let props: Props = $props();

	function bytesToKB(bytes: Int | number | undefined): string {
		return ((Number(bytes) || 0) / 1000).toFixed(2);
	}
</script>

<span {...props}>{bytesToKB(props.bytes)} KB</span>
