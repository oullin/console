import type { FormBuilder } from '#tui/form/builder/index';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { ChoiceOptions, MaybePromise, MultiSearchPromptOptions, SearchPromptOptions, TextPromptOptions } from '#tui/types';

export type PromptBuilderMethods = {
	autocomplete(
		this: FormBuilder,
		label: string,
		options: SuggestOptions['options'],
		defaultValue?: string,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): FormBuilder;
	confirm(
		this: FormBuilder,
		label: string,
		defaultValue?: boolean,
		yes?: string,
		no?: string,
		required?: boolean | string,
		validate?: (value: boolean) => MaybePromise<string | null | undefined>,
		hint?: string,
		name?: string,
		transform?: (value: boolean) => MaybePromise<boolean>,
	): FormBuilder;
	multisearch<T>(this: FormBuilder, options: MultiSearchPromptOptions<T>, name?: string): FormBuilder;
	multiselect<T>(
		this: FormBuilder,
		label: string,
		options: ChoiceOptions<T>,
		defaultValue?: T[],
		scroll?: number,
		required?: boolean | string,
		validate?: (value: T[]) => MaybePromise<string | null | undefined>,
		hint?: string,
		name?: string,
		transform?: (value: T[]) => MaybePromise<T[]>,
	): FormBuilder;
	number(
		this: FormBuilder,
		label: string,
		placeholder?: string,
		defaultValue?: number | string,
		required?: boolean | string,
		validate?: (value: number | string) => MaybePromise<string | null | undefined>,
		hint?: string,
		min?: number,
		max?: number,
		step?: number,
		name?: string,
	): FormBuilder;
	password(
		this: FormBuilder,
		label: string,
		placeholder?: string,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): FormBuilder;
	pause(this: FormBuilder, message?: string, name?: string): FormBuilder;
	search<T>(this: FormBuilder, options: SearchPromptOptions<T>, name?: string): FormBuilder;
	select<T>(
		this: FormBuilder,
		label: string,
		options: ChoiceOptions<T>,
		defaultValue?: T,
		scroll?: number,
		validate?: (value: T) => MaybePromise<string | null | undefined>,
		hint?: string,
		required?: boolean | string,
		name?: string,
		transform?: (value: T) => MaybePromise<T>,
	): FormBuilder;
	suggest(
		this: FormBuilder,
		label: string,
		options: SuggestOptions['options'],
		defaultValue?: string,
		scroll?: number,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): FormBuilder;
	text(
		this: FormBuilder,
		label: string,
		placeholder?: string,
		defaultValue?: string,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): FormBuilder;
	textarea(
		this: FormBuilder,
		label: string,
		placeholder?: string,
		defaultValue?: string,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		rows?: number,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): FormBuilder;
};
