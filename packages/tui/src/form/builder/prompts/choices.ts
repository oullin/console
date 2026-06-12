import { autocomplete, confirm, multiselect, multisearch, pause, search, select, suggest } from '#tui/prompts/choices';
import { previousArray, previousBoolean, previousString, previousValue } from '#tui/form/builder/previous';
import { isSearchPromptLabel } from '#tui/form/builder/prompts/validators/search';
import { isSuggestPromptLabel } from '#tui/form/builder/prompts/validators/suggest';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoicePromptBuilderMethods } from '#tui/form/builder/prompts/types';
import type { ChoiceOptions, MultiSearchPromptOptions, SearchPromptOptions, TextPromptOptions } from '#tui/types';
import type { SuggestOptions } from '#tui/prompts/choices';

function autocompleteFormStep(this: FormBuilder, options: SuggestOptions, name?: string): FormBuilder;
function autocompleteFormStep(
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

function autocompleteFormStep(
	this: FormBuilder,
	optionsOrLabel: SuggestOptions | string,
	options?: SuggestOptions['options'] | string,
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): FormBuilder {
	if (!isSuggestPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => autocomplete({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), options as string | undefined);
	}

	return this.add(
		(_, previous) =>
			autocomplete({
				message: optionsOrLabel,
				label: optionsOrLabel,
				options: options as SuggestOptions['options'],
				placeholder,
				default: previousString(previous, defaultValue),
				required,
				validate,
				hint,
				transform,
			}),
		name,
	);
}

function suggestFormStep(this: FormBuilder, options: SuggestOptions, name?: string): FormBuilder;
function suggestFormStep(
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

function suggestFormStep(
	this: FormBuilder,
	optionsOrLabel: SuggestOptions | string,
	options?: SuggestOptions['options'] | string,
	placeholder = '',
	defaultValue = '',
	scroll = 5,
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): FormBuilder {
	if (!isSuggestPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => suggest({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), options as string | undefined);
	}

	return this.add(
		(_, previous) =>
			suggest({
				message: optionsOrLabel,
				label: optionsOrLabel,
				options: options as SuggestOptions['options'],
				placeholder,
				default: previousString(previous, defaultValue),
				scroll,
				required,
				validate,
				hint,
				transform,
			}),
		name,
	);
}

export const choicePromptBuilderMethods: ChoicePromptBuilderMethods & ThisType<FormBuilder> = {
	autocomplete: autocompleteFormStep,
	confirm(label, defaultValue = true, yes = 'Yes', no = 'No', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => confirm(label, previousBoolean(previous, defaultValue), yes, no, required, validate, hint, transform), name);
	},
	multisearch<T>(
		optionsOrLabel: MultiSearchPromptOptions<T> | string,
		options?: MultiSearchPromptOptions<T>['options'] | string,
		placeholder = '',
		scroll = 5,
		required: MultiSearchPromptOptions<T>['required'] = false,
		validate: MultiSearchPromptOptions<T>['validate'] = undefined,
		hint = 'Use the space bar to select options.',
		name?: string,
		transform: MultiSearchPromptOptions<T>['transform'] = undefined,
	) {
		if (!isSearchPromptLabel(optionsOrLabel)) {
			return this.add((_, previous) => multisearch<T>({ ...optionsOrLabel, default: previousArray(previous, optionsOrLabel.default ?? []) }), options as string | undefined);
		}

		const promptOptions: MultiSearchPromptOptions<T> = {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: options as MultiSearchPromptOptions<T>['options'],
			placeholder,
			scroll,
			required,
			validate,
			hint,
			transform,
		};

		return this.add((_, previous) => multisearch<T>({ ...promptOptions, default: previousArray(previous, promptOptions.default ?? []) }), name);
	},
	multiselect<T>(
		label: string,
		options: ChoiceOptions<T>,
		defaultValue: T[] = [],
		scroll = 5,
		required: boolean | string = false,
		validate = undefined,
		hint = 'Use the space bar to select options.',
		name?: string,
		transform = undefined,
	) {
		return this.add((_, previous) => multiselect({ message: label, options, default: previousArray(previous, defaultValue), scroll, required, validate, hint, transform }), name);
	},
	pause(message = 'Press enter to continue...', name?: string) {
		return this.add(() => pause(message), name);
	},
	search<T>(
		optionsOrLabel: SearchPromptOptions<T> | string,
		options?: SearchPromptOptions<T>['options'] | string,
		placeholder = '',
		scroll = 5,
		validate: SearchPromptOptions<T>['validate'] = undefined,
		hint = '',
		required: SearchPromptOptions<T>['required'] = true,
		name?: string,
		transform: SearchPromptOptions<T>['transform'] = undefined,
	) {
		if (!isSearchPromptLabel(optionsOrLabel)) {
			return this.add((_, previous) => search<T>({ ...optionsOrLabel, default: previousValue(previous, optionsOrLabel.default) }), options as string | undefined);
		}

		const promptOptions: SearchPromptOptions<T> = {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: options as SearchPromptOptions<T>['options'],
			placeholder,
			scroll,
			validate,
			hint,
			required,
			transform,
		};

		return this.add((_, previous) => search<T>({ ...promptOptions, default: previousValue(previous, promptOptions.default) }), name);
	},
	select<T>(label: string, options: ChoiceOptions<T>, defaultValue?: T, scroll = 5, validate = undefined, hint = '', required: boolean | string = true, name?: string, transform = undefined) {
		return this.add((_, previous) => select({ message: label, options, default: previousValue(previous, defaultValue), scroll, validate, hint, required, transform }), name);
	},
	suggest: suggestFormStep,
};
