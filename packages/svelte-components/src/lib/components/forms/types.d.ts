export interface FormContentProps {
	children: Snippet;
	class?: string;
}

export interface FormHeaderProps {
	title: string;
	text: string;
}

export interface FormSectionProps {
	children: Snippet;
}

export interface LabelProps extends HTMLLabelAttributes {
	for: string;
	children: Snippet;
}
