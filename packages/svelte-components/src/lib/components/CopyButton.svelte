<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import { type ComponentProps } from 'svelte';
	import { BROWSER, DEV } from 'esm-env';
	import IconButton from './IconButton.svelte';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';

	interface Props extends Omit<ComponentProps<typeof IconButton>, 'icon'> {
		data: string;
	}

	let props: Props = $props();

	let hint = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (DEV) console.info(props.data, 'copied to clipboard');
			hint = true;
			setTimeout(() => (hint = false), 500);
		} catch (err) {
			if (DEV) console.error('Failed to copy text: ', err);
		}
	}
</script>

{#if BROWSER && 'clipboard' in navigator}
	{#if hint}
		<IconButton icon={ClipboardCheck} {...props} />
	{:else}
		<IconButton icon={Copy} onclick={copyToClipboard} {...props} />
	{/if}
{/if}
