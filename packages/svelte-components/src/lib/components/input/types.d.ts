export interface AssetInputProps extends ComponentProps<typeof TextInput> {
	min?: number;
	max?: number;
	valid?: boolean;
	validPrecision?: boolean;
	validMinimum?: boolean;
	validMaximum?: boolean;
	value: Asset;
	debug?: boolean;
}

export interface BytesInputProps extends ComponentProps<typeof TextInput> {
	valid?: boolean;
	validMinimum?: boolean;
	validMaximum?: boolean;
	value: number | undefined;
	debug?: boolean;
}

export interface DatetimeInputProps extends HTMLInputAttributes {
	date?: Date;
	value?: string;
	min?: string;
	children?: Snippet;
	debug?: boolean;
}

export interface NameInputProps extends ComponentProps<typeof TextInput> {
	optional?: boolean;
	valid?: boolean;
	value: NameType;
	debug?: boolean;
}

export interface NumberInputProps extends ComponentProps<typeof TextInput> {
	ref?: HTMLInputElement;
	valid?: boolean;
	value?: number;
	unit?: string;
	min?: number;
	max?: number;
	debug?: boolean;
}

export interface PublicKeyInputProps extends ComponentProps<typeof TextInput> {
	optional?: boolean;
	valid?: boolean;
	value: PublicKeyType | undefined;
	debug?: boolean;
}

export interface SymbolInputProps extends ComponentProps<typeof TextInput> {
	optional?: boolean;
	valid?: boolean;
	value: Asset.SymbolType;
	debug?: boolean;
}

export interface TextInputProps extends HTMLInputAttributes {
	ref?: HTMLInputElement;
	children?: Snippet;
	label?: string;
}
