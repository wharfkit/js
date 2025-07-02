import type { Snippet } from 'svelte';

export interface ProgressProps {
	children?: Snippet;
	percentage: number;
}
