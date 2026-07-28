<script lang="ts">
	import { createSwitch, melt, type CreateSwitchProps } from '@melt-ui/svelte';
	import { get, writable } from 'svelte/store';

	export interface SwitchProps extends Omit<CreateSwitchProps, 'checked'> {
		id: string;
		checked: boolean;
	}

	let {
		id,
		disabled = $bindable(false),
		checked = $bindable(false),
		required = false,
		...otherProps
	}: SwitchProps = $props();

	const internalCheckedStore = writable(checked);

	const {
		elements: { root, input },
		options
	} = createSwitch({
		checked: internalCheckedStore,
		disabled,
		required,
		defaultChecked: checked,
		...otherProps
	});

	$effect(() => {
		// If the external prop changes, update the internal store.
		if (get(internalCheckedStore) !== checked) {
			internalCheckedStore.set(checked);
		}

		// If the internal store changes (from user click), update the external prop.
		const unsubscribe = internalCheckedStore.subscribe((value) => {
			if (value !== checked) {
				checked = value;
			}
		});

		// Cleanup the subscription.
		return () => unsubscribe();
	});

	// Keep the Melt `disabled` option in sync with the prop.
	$effect(() => {
		options.disabled.set(disabled);
	});

	const ariaLabelledBy = `${id}-label`;
</script>

<div class="flex items-center">
	<button
		{id}
		use:melt={$root}
		class=" border-outline *:bg-outline focus-visible:border-focus focus-visible:outline-focus data-[state=checked]:*:bg-on-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:hover:bg-primary/90 data-[state=checked]:hover:border-primary/90 relative h-8 w-[52px] cursor-pointer rounded-full border-2 bg-transparent *:size-4 *:translate-x-1.5 *:transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:*:translate-x-[26px] data-[state=checked]:*:scale-150"
		aria-labelledby={ariaLabelledBy}
	>
		<span class="thumb block rounded-full"></span>
	</button>
	<input use:melt={$input} />
</div>
