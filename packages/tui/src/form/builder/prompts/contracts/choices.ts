import type { FormBuilder } from '#tui/form/builder/index';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { ChoiceOptions, MaybePromise, MultiSearchPromptOptions, SearchPromptOptions, TextPromptOptions } from '#tui/types';

export type ChoicePromptBuilderMethods = {
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
	multisearch<T>(
		this: FormBuilder,
		label: string,
		options: MultiSearchPromptOptions<T>['options'],
		placeholder?: string,
		scroll?: number,
		required?: MultiSearchPromptOptions<T>['required'],
		validate?: MultiSearchPromptOptions<T>['validate'],
		hint?: string,
		name?: string,
		transform?: MultiSearchPromptOptions<T>['transform'],
	): FormBuilder;
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
	pause(this: FormBuilder, message?: string, name?: string): FormBuilder;
	search<T>(this: FormBuilder, options: SearchPromptOptions<T>, name?: string): FormBuilder;
	search<T>(
		this: FormBuilder,
		label: string,
		options: SearchPromptOptions<T>['options'],
		placeholder?: string,
		scroll?: number,
		validate?: SearchPromptOptions<T>['validate'],
		hint?: string,
		required?: SearchPromptOptions<T>['required'],
		name?: string,
		transform?: SearchPromptOptions<T>['transform'],
	): FormBuilder;
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
		placeholder?: string,
		defaultValue?: string,
		scroll?: number,
		required?: boolean | string,
		validate?: TextPromptOptions['validate'],
		hint?: string,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): FormBuilder;
};
