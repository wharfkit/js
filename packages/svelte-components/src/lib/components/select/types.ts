import { type SelectOption } from '@melt-ui/svelte';

export interface ExtendedSelectOption extends SelectOption {
	image?: string;
}

export type SelectOptionVariant = 'pill' | 'form';
