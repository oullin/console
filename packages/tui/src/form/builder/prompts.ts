import { autocomplete, confirm, multiselect, multisearch, pause, search, select, suggest } from '#tui/prompts/choices';
import { number, password, text, textarea } from '#tui/prompts/basic';
import { previousArray, previousNumber, previousString } from '#tui/form/builder/previous';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoiceInput, MaybePromise, MultiSearchPromptOptions, SearchPromptOptions, TextPromptOptions } from '#tui/types';
import type { SuggestOptions } from '#tui/prompts/choices';

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
		validate?: (value: boolean) => MaybePromise<string | false | null | undefined>,
		hint?: string,
		name?: string,
	): FormBuilder;
	multisearch<T>(this: FormBuilder, options: MultiSearchPromptOptions<T>, name?: string): FormBuilder;
	multiselect<T>(
		this: FormBuilder,
		label: string,
		options: Array<ChoiceInput<T>>,
		defaultValue?: T[],
		scroll?: number,
		required?: boolean | string,
		validate?: (value: T[]) => MaybePromise<string | false | null | undefined>,
		hint?: string,
		name?: string,
	): FormBuilder;
	number(
		this: FormBuilder,
		label: string,
		placeholder?: string,
		defaultValue?: number | string,
		required?: boolean | string,
		validate?: (value: number | string) => MaybePromise<string | false | null | undefined>,
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
		options: Array<ChoiceInput<T>>,
		defaultValue?: T,
		scroll?: number,
		validate?: (value: T) => MaybePromise<string | false | null | undefined>,
		hint?: string,
		required?: boolean | string,
		name?: string,
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

export const promptBuilderMethods: PromptBuilderMethods & ThisType<FormBuilder> = {
	autocomplete(label, options, defaultValue = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => autocomplete({ message: label, label, options, default: previousString(previous, defaultValue), required, validate, hint, transform }), name);
	},
	confirm(label, defaultValue = true, yes = 'Yes', no = 'No', required = false, validate = undefined, hint = '', name) {
		return this.add(() => confirm(label, defaultValue, yes, no, required, validate, hint), name);
	},
	multisearch<T>(options: MultiSearchPromptOptions<T>, name?: string) {
		return this.add(() => multisearch(options), name);
	},
	multiselect<T>(
		label: string,
		options: Array<ChoiceInput<T>>,
		defaultValue: T[] = [],
		scroll = 5,
		required: boolean | string = false,
		validate = undefined,
		hint = 'Use the space bar to select options.',
		name?: string,
	) {
		return this.add((_, previous) => multiselect({ message: label, options, default: previousArray(previous, defaultValue), scroll, required, validate, hint }), name);
	},
	number(label, placeholder = '', defaultValue = 0, required = false, validate = undefined, hint = '', min, max, step, name) {
		return this.add((_, previous) => number(label, placeholder, previousNumber(previous, defaultValue), required, validate, hint, min, max, step), name);
	},
	password(label, placeholder = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add(() => password(label, placeholder, required, validate, hint, transform), name);
	},
	pause(message = 'Press enter to continue...', name?: string) {
		return this.add(() => pause(message), name);
	},
	search<T>(options: SearchPromptOptions<T>, name?: string) {
		return this.add(() => search(options), name);
	},
	select<T>(label: string, options: Array<ChoiceInput<T>>, defaultValue?: T, scroll = 5, validate = undefined, hint = '', required: boolean | string = true, name?: string) {
		return this.add((_, previous) => select({ message: label, options, default: previous === undefined ? defaultValue : (previous as T), scroll, validate, hint, required }), name);
	},
	suggest(label, options, defaultValue = '', scroll = 5, required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => suggest({ message: label, label, options, default: previousString(previous, defaultValue), scroll, required, validate, hint, transform }), name);
	},
	text(label, placeholder = '', defaultValue = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => text(label, placeholder, previousString(previous, defaultValue), required, validate, hint, transform), name);
	},
	textarea(label, placeholder = '', defaultValue = '', required = false, validate = undefined, hint = '', rows = 5, name, transform = undefined) {
		return this.add((_, previous) => textarea(label, placeholder, previousString(previous, defaultValue), required, validate, hint, rows, transform), name);
	},
};
