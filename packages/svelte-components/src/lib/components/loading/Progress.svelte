<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { type Snippet } from 'svelte';

	export interface ProgressProps {
		children?: Snippet;
		percentage: number;
	}

	const { children, percentage = 0 }: ProgressProps = $props();

	const tween = new Tween(0, {
		duration: 400,
		easing: cubicInOut
	});

	const girth = 2 * Math.PI * 28;

	const dasharray = $derived(`${tween.current * girth},${girth}`);

	$effect(() => {
		tween.target = percentage / 100;
	});
</script>

<div class="relative h-[80px] w-[80px]">
	<svg viewBox="0 0 60 60">
		<circle cx="30" cy="30" r="28" class="stroke-outline fill-none stroke-4" />
		<circle
			cx="30"
			cy="30"
			r="28"
			transform="rotate(-90, 30, 30)"
			stroke-dasharray={dasharray}
			class="stroke-primary fill-none stroke-4"
		/>
	</svg>
	{#if children}
		<div class="absolute inset-0 flex items-center justify-center">
			{@render children()}
		</div>
	{/if}
</div>
