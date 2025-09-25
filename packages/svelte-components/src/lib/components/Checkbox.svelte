<script lang="ts">
	import { createCheckbox, type CreateCheckboxProps, melt } from '@melt-ui/svelte';
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';
	import { get, writable } from 'svelte/store';

	export interface CheckboxProps extends Omit<CreateCheckboxProps, 'checked'> {
		id: string;
		checked?: boolean | 'indeterminate';
	}

	let {
		id,
		defaultChecked = false,
		checked = $bindable(defaultChecked),
		disabled = $bindable(false),
		...otherProps
	}: CheckboxProps = $props();

	const internalCheckedStore = writable(checked);

	const {
		elements: { root, input },
		options,
		helpers: { isChecked, isIndeterminate }
	} = createCheckbox({
		checked: internalCheckedStore,
		defaultChecked,
		disabled,
		...otherProps
	});

	$effect(() => {
		// When the external prop changes, update the internal store.
		if (get(internalCheckedStore) !== checked) {
			internalCheckedStore.set(checked);
		}

		// When the internal store changes (e.g., user clicks), update the external prop.
		const unsubscribe = internalCheckedStore.subscribe((value) => {
			if (value !== checked) {
				checked = value;
			}
		});

		// Cleanup the subscription
		return () => unsubscribe();
	});

	// Sync external "disabled" prop with Melt's internal store
	$effect(() => {
		options.disabled.set(disabled);
	});

	const ariaLabelledBy = `${id}-label`;
</script>

<div class="flex items-center">
	<button
		use:melt={$root}
		class=" border-outline focus-visible:border-solar-500 focus-visible:outline-solar-500 disabled:border-on-surface disabled:bg-on-surface data-[state=checked]:disabled:border-on-surface data-[state=checked]:disabled:bg-on-surface text-on-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:hover:border-primary data-[state=checked]:hover:bg-primary/90 disabled:text-surface flex size-5 cursor-pointer appearance-none items-center justify-center rounded border border-solid bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-30"
		{id}
		aria-labelledby={ariaLabelledBy}
	>
		{#if $isChecked}
			<Check class="size-3.5 stroke-[3.5px]" />
		{:else if $isIndeterminate}
			<Minus class="text-on-surface/30 size-3.5 stroke-[3.5px]" />
		{/if}
		<input use:melt={$input} />
	</button>
</div>
