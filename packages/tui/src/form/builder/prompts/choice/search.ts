import { search } from '#tui/prompts/choices';
import { previousValue } from '#tui/form/builder/previous';
import { isSearchPromptLabel, parseSearchChoiceSource, parseSearchStepName } from '#tui/form/builder/prompts/validators/search';
import type { FormBuilder } from '#tui/form/builder/index';
import type { SearchPromptOptions } from '#tui/types';

export function searchFormStep<T>(this: FormBuilder, options: SearchPromptOptions<T>, name?: string): FormBuilder;

export function searchFormStep<T>(
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
	info?: SearchPromptOptions<T>['info'],
): FormBuilder;

export function searchFormStep<T>(
	this: FormBuilder,
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
): FormBuilder {
	if (!isSearchPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => search<T>({ ...optionsOrLabel, default: previousValue(previous, optionsOrLabel.default) }), parseSearchStepName(options));
	}

	const promptOptions: SearchPromptOptions<T> = {
		message: optionsOrLabel,
		label: optionsOrLabel,
		options: parseSearchChoiceSource<T>(options),
		placeholder,
		scroll,
		validate,
		hint,
		required,
		transform,
		info,
	};

	return this.add((_, previous) => search<T>({ ...promptOptions, default: previousValue(previous, promptOptions.default) }), name);
}
