import { autocomplete, confirm, multiselect, multisearch, pause, search, select, suggest } from '#tui/prompts/choices';
import { previousArray, previousBoolean, previousString, previousValue } from '#tui/form/builder/previous';
import { isSearchPromptLabel } from '#tui/form/builder/prompts/validators/search';
import { isSelectPromptLabel } from '#tui/form/builder/prompts/validators/select';
import { isSuggestPromptLabel } from '#tui/form/builder/prompts/validators/suggest';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoicePromptBuilderMethods } from '#tui/form/builder/prompts/types';
import type { ChoiceOptions, ConfirmPromptOptions, MultiSearchPromptOptions, MultiSelectPromptOptions, SearchPromptOptions, SelectPromptOptions, TextPromptOptions } from '#tui/types';
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
	info?: SuggestOptions['info'],
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
	info: SuggestOptions['info'] = '',
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
				info,
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
	info?: SuggestOptions['info'],
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
	info: SuggestOptions['info'] = '',
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
				info,
			}),
		name,
	);
}

function confirmFormStep(this: FormBuilder, options: ConfirmPromptOptions, name?: string): FormBuilder;
function confirmFormStep(
	this: FormBuilder,
	label: string,
	defaultValue?: boolean,
	yes?: string,
	no?: string,
	required?: boolean | string,
	validate?: ConfirmPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: ConfirmPromptOptions['transform'],
): FormBuilder;

function confirmFormStep(
	this: FormBuilder,
	optionsOrLabel: ConfirmPromptOptions | string,
	defaultValueOrName: boolean | string = true,
	yes = 'Yes',
	no = 'No',
	required: boolean | string = false,
	validate: ConfirmPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: ConfirmPromptOptions['transform'] = undefined,
): FormBuilder {
	if (!isSelectPromptLabel(optionsOrLabel)) {
		const formStepName = isSelectPromptLabel(defaultValueOrName) ? defaultValueOrName : undefined;

		return this.add((_, previous) => confirm({ ...optionsOrLabel, default: previousBoolean(previous, optionsOrLabel.default ?? true) }), formStepName);
	}

	return this.add((_, previous) => confirm(optionsOrLabel, previousBoolean(previous, defaultValueOrName as boolean), yes, no, required, validate, hint, transform), name);
}

function multiselectFormStep<T>(this: FormBuilder, options: MultiSelectPromptOptions<T>, name?: string): FormBuilder;
function multiselectFormStep<T>(
	this: FormBuilder,
	label: string,
	options: ChoiceOptions<T>,
	defaultValue?: T[],
	scroll?: number,
	required?: boolean | string,
	validate?: MultiSelectPromptOptions<T>['validate'],
	hint?: string,
	name?: string,
	transform?: MultiSelectPromptOptions<T>['transform'],
	info?: MultiSelectPromptOptions<T>['info'],
): FormBuilder;

function multiselectFormStep<T>(
	this: FormBuilder,
	optionsOrLabel: MultiSelectPromptOptions<T> | string,
	optionsOrName?: ChoiceOptions<T> | string,
	defaultValue: T[] = [],
	scroll = 5,
	required: boolean | string = false,
	validate: MultiSelectPromptOptions<T>['validate'] = undefined,
	hint = 'Use the space bar to select options.',
	name?: string,
	transform: MultiSelectPromptOptions<T>['transform'] = undefined,
	info: MultiSelectPromptOptions<T>['info'] = '',
): FormBuilder {
	if (!isSelectPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => multiselect<T>({ ...optionsOrLabel, default: previousArray(previous, optionsOrLabel.default ?? []) }), optionsOrName as string | undefined);
	}

	return this.add(
		(_, previous) =>
			multiselect<T>({
				message: optionsOrLabel,
				options: optionsOrName as ChoiceOptions<T>,
				default: previousArray(previous, defaultValue),
				scroll,
				required,
				validate,
				hint,
				transform,
				info,
			}),
		name,
	);
}

function selectFormStep<T>(this: FormBuilder, options: SelectPromptOptions<T>, name?: string): FormBuilder;
function selectFormStep<T>(
	this: FormBuilder,
	label: string,
	options: ChoiceOptions<T>,
	defaultValue?: T,
	scroll?: number,
	validate?: SelectPromptOptions<T>['validate'],
	hint?: string,
	required?: boolean | string,
	name?: string,
	transform?: SelectPromptOptions<T>['transform'],
	info?: SelectPromptOptions<T>['info'],
): FormBuilder;

function selectFormStep<T>(
	this: FormBuilder,
	optionsOrLabel: SelectPromptOptions<T> | string,
	optionsOrName?: ChoiceOptions<T> | string,
	defaultValue?: T,
	scroll = 5,
	validate: SelectPromptOptions<T>['validate'] = undefined,
	hint = '',
	required: boolean | string = true,
	name?: string,
	transform: SelectPromptOptions<T>['transform'] = undefined,
	info: SelectPromptOptions<T>['info'] = '',
): FormBuilder {
	if (!isSelectPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => select<T>({ ...optionsOrLabel, default: previousValue(previous, optionsOrLabel.default) }), optionsOrName as string | undefined);
	}

	return this.add(
		(_, previous) =>
			select<T>({
				message: optionsOrLabel,
				options: optionsOrName as ChoiceOptions<T>,
				default: previousValue(previous, defaultValue),
				scroll,
				validate,
				hint,
				required,
				transform,
				info,
			}),
		name,
	);
}

export const choicePromptBuilderMethods: ChoicePromptBuilderMethods & ThisType<FormBuilder> = {
	autocomplete: autocompleteFormStep,
	confirm: confirmFormStep,
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
		info: MultiSearchPromptOptions<T>['info'] = '',
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
			info,
		};

		return this.add((_, previous) => multisearch<T>({ ...promptOptions, default: previousArray(previous, promptOptions.default ?? []) }), name);
	},
	multiselect: multiselectFormStep,
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
		info: SearchPromptOptions<T>['info'] = '',
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
			info,
		};

		return this.add((_, previous) => search<T>({ ...promptOptions, default: previousValue(previous, promptOptions.default) }), name);
	},
	select: selectFormStep,
	suggest: suggestFormStep,
};
