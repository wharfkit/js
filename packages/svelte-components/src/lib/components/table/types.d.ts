import type { Snippet } from 'svelte';

export interface TableProps {
	thead?: Snippet;
	colgroup?: Snippet;
	children: Snippet;
	class?: string;
	fixed?: boolean;
	full?: boolean;
}
