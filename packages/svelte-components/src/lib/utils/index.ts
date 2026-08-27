import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			text: [
				'display',
				'display--line-height',
				'display--font-weight',
				'headline',
				'headline--line-height',
				'headline--font-weight',
				'title',
				'title--line-height',
				'title--font-weight',
				'body',
				'body--line-height',
				'body--font-weight',
				'label',
				'label--line-height',
				'label--font-weight',
				'label-sm',
				'label-sm--line-height',
				'label-sm-weight'
			]
		}
	}
});

/**
 * Appends strings of classes. If non-truthy values are passed, they are ignored.
 * Uses tailwind-merge to merge tailwind classes.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

let counter = 0;
export function createUID(prefix = 'el') {
	return `${prefix}-${counter++}`;
}
