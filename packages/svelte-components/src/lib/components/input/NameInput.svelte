<script module>
	export const NameValidationError = {
		INVALID_CHARACTERS: 'INVALID_CHARACTERS',
		INVALID_LENGTH_MIN: 'INVALID_LENGTH_MIN',
		INVALID_LENGTH_MAX: 'INVALID_LENGTH_MAX'
	} as const;

	export type NameValidationError = (typeof NameValidationError)[keyof typeof NameValidationError];
</script>

<script lang="ts">
	import { Name, type NameType } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import TextInput from './TextInput.svelte';

	export interface NameInputProps extends ComponentProps<typeof TextInput> {
		optional?: boolean;
		value: NameType;
		debug?: boolean;
		valid?: boolean;
		error?: NameValidationError;
	}

	let {
		autofocus = false,
		optional = false,
		ref = $bindable(),
		valid = $bindable(false),
		value: _value = $bindable(),
		error = $bindable(),
		debug = false,
		...props
	}: NameInputProps = $props();

	/** The string value bound to the form input */
	let input: string = $state(_value ? String(_value) : '');

	/** The derived name from the formatted input */
	const name: Name = $derived(Name.from(input));

	/** Validation states */
	const satisfiesMinLength = $derived(String(name).length > 0);
	const satisfiesMaxLength = $derived(String(name).length <= 12);
	const satisfiesNameMatch = $derived(String(name) === input);

	/** Whether or not the input value is valid */
	const satisfies: boolean = $derived(
		optional || (satisfiesMinLength && satisfiesMaxLength && satisfiesNameMatch)
	);

	/** Set the input value from a parent */
	export function set(name: string) {
		input = name;
	}

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		if (satisfies) {
			_value = name;
			error = undefined;
		} else {
			_value = Name.from(''); // Still return a $bindable Name
			if (!satisfiesMinLength) error = NameValidationError.INVALID_LENGTH_MIN;
			if (!satisfiesMaxLength) error = NameValidationError.INVALID_LENGTH_MAX;
			if (!satisfiesNameMatch) error = NameValidationError.INVALID_CHARACTERS;
		}
	});
</script>

<TextInput bind:ref bind:value={input} {autofocus} {...props} />

{#if debug}
	<h3>Component State</h3>
	<pre>
input (string):   "{input}"
Name:             {name}
    
---

Valid Input:       {satisfies}
Valid Min Length:  {satisfiesMinLength}
Valid Max Length:  {satisfiesMaxLength}
Valid Name:        {satisfiesNameMatch}
</pre>
{/if}
