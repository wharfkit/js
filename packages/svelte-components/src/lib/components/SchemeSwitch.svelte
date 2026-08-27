<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Switch from './Switch.svelte';
	import type { CreateSwitchProps } from '@melt-ui/svelte';
	import { BROWSER } from 'esm-env';
	import Label from './forms/Label.svelte';

	let darkMode = $state(BROWSER && localStorage.getItem('color-scheme') === 'dark');

	const onDarkModeToggle: CreateSwitchProps['onCheckedChange'] = ({ next }) => {
		const scheme = next ? 'dark' : 'light';
		localStorage.setItem('color-scheme', scheme);
		document.documentElement.setAttribute('data-scheme', scheme);
		document.documentElement.style.setProperty('color-scheme', scheme);
		return next;
	};
</script>

<svelte:head>
	<!-- Init color scheme on page load -->
	<script>
		(function () {
			if (typeof window !== undefined) {
				const storedTheme = localStorage.getItem('color-scheme');
				const theme =
					storedTheme ||
					(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
				document.documentElement.setAttribute('data-scheme', theme);
				if (!storedTheme) localStorage.setItem('color-scheme', theme);
			}
		})();
	</script>
</svelte:head>

<div class="flex items-center gap-2">
	<Label for="color-scheme">
		<Moon />
		<span class="sr-only">Dark mode</span>
	</Label>
	<Switch id="color-scheme" onCheckedChange={onDarkModeToggle} bind:checked={darkMode} />
</div>
