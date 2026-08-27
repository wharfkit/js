import { type SelectOption } from '@melt-ui/svelte';

export interface ExtendedSelectOption<T = unknown> extends SelectOption<T> {
	image?: string;
}

export type SelectOptionVariant = 'pill' | 'form';
