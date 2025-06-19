<script lang="ts">
	import { cn } from '$lib/utils';
	import type { PrivateKey, PublicKey } from '@wharfkit/antelope';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		key?: PublicKey | PrivateKey | string;
		icon?: boolean;
		href: string;
	}

	let { key, icon, href, ...props }: Props = $props();
</script>

{#if key}
	<a
		{href}
		{...props}
		class={cn(
			'text-primary hover:text-primary-hover inline-grid grid-cols-[auto_1fr] items-start gap-2 font-mono',
			props.class
		)}
	>
		{#if icon}
			<div class="content-center pt-0.5">
				<KeyRound class="size-4 shrink-0 " />
			</div>
		{/if}
		<span class="break-all">
			{String(key)}
		</span>
	</a>
{/if}
