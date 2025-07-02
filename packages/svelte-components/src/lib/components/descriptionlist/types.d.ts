export type DescriptionItem = {
	title: string;
	description: string;
};

export interface DLProps {
	items?: DescriptionItem[];
	children?: Snippet;
	class?: string;
}

export interface DLRowProps {
	title: string | Snippet;
	description?: string;
	children?: Snippet;
}
