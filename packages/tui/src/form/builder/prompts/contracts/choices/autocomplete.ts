import type { FormBuilder } from '#tui/form/builder/index';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { TextPromptOptions } from '#tui/types';

export type AutocompletePromptBuilderMethods = {
	autocomplete(this: FormBuilder, options: SuggestOptions, name?: string): FormBuilder;
	autocomplete(
		this: FormBuilder,
		label: string,
		options: SuggestOptions['options'],
		placeholder?: string,
		defaultValue?: string,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
		info?: SuggestOptions['info'],
	): FormBuilder;
};
