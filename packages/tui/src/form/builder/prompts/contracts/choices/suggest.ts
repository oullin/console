import type { FormBuilder } from '#tui/form/builder/index';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { TextPromptOptions } from '#tui/types';

export type SuggestPromptBuilderMethods = {
	suggest(this: FormBuilder, options: SuggestOptions, name?: string): FormBuilder;
	suggest(
		this: FormBuilder,
		label: string,
		options: SuggestOptions['options'],
		placeholder?: string,
		defaultValue?: string,
		scroll?: number,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
		info?: SuggestOptions['info'],
	): FormBuilder;
};
