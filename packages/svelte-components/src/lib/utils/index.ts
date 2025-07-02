import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
