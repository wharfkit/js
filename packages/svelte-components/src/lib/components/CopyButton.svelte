<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import { type ComponentProps } from 'svelte';
	import { BROWSER, DEV } from 'esm-env';
	import IconButton from './IconButton.svelte';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';

	export interface CopyButtonProps extends Omit<ComponentProps<typeof IconButton>, 'icon'> {
		data: string;
		label?: string;
	}

	let props: CopyButtonProps = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (DEV) console.info(props.data, 'copied to clipboard');
			copied = true;
			setTimeout(() => (copied = false), 500);
		} catch (err) {
			if (DEV) console.error('Failed to copy text: ', err);
		}
	}
</script>

{#if BROWSER && 'clipboard' in navigator}
	{#if copied}
		<IconButton icon={ClipboardCheck} {...props} />
	{:else}
		<IconButton label={props.label || 'Copy'} icon={Copy} onclick={copyToClipboard} {...props} />
	{/if}
{/if}
