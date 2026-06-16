import { multisearch } from '#tui/prompts/choices';
import { previousArray } from '#tui/form/builder/previous';
import { isSearchPromptOptions, parseSearchChoiceSource, parseSearchStepName } from '#tui/form/builder/prompts/validators/search';
import type { FormBuilder } from '#tui/form/builder/index';
import type { MultiSearchPromptOptions } from '#tui/types';

export function multisearchFormStep<T>(this: FormBuilder, options: MultiSearchPromptOptions<T>, name?: string): FormBuilder;

export function multisearchFormStep<T>(
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
	info?: MultiSearchPromptOptions<T>['info'],
): FormBuilder;

export function multisearchFormStep<T>(
	this: FormBuilder,
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
): FormBuilder {
	if (isSearchPromptOptions(optionsOrLabel)) {
		return this.add((_, previous) => multisearch<T>({ ...optionsOrLabel, default: previousArray(previous, optionsOrLabel.default ?? []) }), parseSearchStepName(options));
	}

	const promptOptions: MultiSearchPromptOptions<T> = {
		message: optionsOrLabel,
		label: optionsOrLabel,
		options: parseSearchChoiceSource<T>(options),
		placeholder,
		scroll,
		required,
		validate,
		hint,
		transform,
		info,
	};

	return this.add((_, previous) => multisearch<T>({ ...promptOptions, default: previousArray(previous, promptOptions.default ?? []) }), name);
}
