<script lang="ts">
	import { cn, createUID } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Label from '../forms/Label.svelte';
	import { Fieldset } from '$lib';

	export interface TextInputProps extends HTMLInputAttributes {
		ref?: HTMLInputElement;
		children?: Snippet;
		label?: string;
	}

	let {
		ref = $bindable(),
		value = $bindable(),
		class: className,
		...props
	}: TextInputProps = $props();

	/** Set the input value from a parent */
	export function set(newValue: string | undefined) {
		value = newValue;
	}

	let id = props.id || createUID();
</script>

{#if props.label}
	<Fieldset>
		<Label for={id}>{props.label}</Label>
		{@render input()}
	</Fieldset>
{:else}
	{@render input()}
{/if}

{#snippet input()}
	<div
		class={cn(
			'border-outline bg-surface focus-within:border-primary relative flex h-12 items-center gap-2 rounded-lg border-2 px-4',
			props.disabled && 'text-muted border-outline',
			className
		)}
	>
		<input
			class="placeholder:text-muted w-full rounded-sm bg-transparent font-medium placeholder:opacity-80 focus:outline-hidden"
			type="text"
			autocorrect="off"
			autocomplete="off"
			autocapitalize="off"
			bind:this={ref}
			bind:value
			{...props}
			{id}
		/>

		<div class="text-muted select-none">
			{@render props.children?.()}
		</div>
	</div>
{/snippet}
