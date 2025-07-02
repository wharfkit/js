<script lang="ts">
	import { cn } from '$lib/utils';
	import { type Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import UserIcon from '@lucide/svelte/icons/user';
	import { Name } from '@wharfkit/antelope';

	export interface AccountProps extends HTMLAnchorAttributes {
		name: Name | string;
		href: string;
		children?: Snippet;
		icon?: boolean;
	}

	let { href, name, children, ...props }: AccountProps = $props();
</script>

<a
	{href}
	{...props}
	class={cn(
		'focus-visible:outline-solar-500 text-primary hover:text-primary-hover inline-flex items-center gap-2 focus-visible:outline ',
		props.class
	)}
>
	{#if props.icon}
		<UserIcon class="mb-0.5 size-4" />
	{/if}

	{#if children}
		{@render children()}
	{:else}
		<span class="font-mono">
			{name}
		</span>
	{/if}
</a>
