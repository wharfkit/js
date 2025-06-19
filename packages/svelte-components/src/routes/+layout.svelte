<script lang="ts">
	import { SchemeSwitch } from '$lib';
	import { onMount } from 'svelte';

	let props = $props();

	type TOCItem = {
		id: string;
		title: string;
	};

	let toc: TOCItem[] = $state([]);

	onMount(() => {
		const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];

		toc = sections.map((section) => {
			const id = section.id;
			// Try to use the first heading inside the section as title
			const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
			const title = heading?.textContent?.trim() ?? id;

			return { id, title };
		});
	});
</script>

<div class="mx-auto flex w-[calc(100%-4rem)] max-w-6xl flex-wrap gap-12 py-12">
	<main class="min-w-3/4 grow-[999] basis-0 scroll-p-4 space-y-12">
		<div class="space-y-4">
			<h1 class="text-display">Component Directory</h1>
		</div>
		{@render props.children()}
	</main>

	<nav class="grow basis-0">
		<menu class="sticky top-12 space-y-4">
			<SchemeSwitch />
			{#each toc as item (item.id)}
				<li class="text-nowrap"><a href={`#${item.id}`}>{item.title}</a></li>
			{/each}
		</menu>
	</nav>
</div>
