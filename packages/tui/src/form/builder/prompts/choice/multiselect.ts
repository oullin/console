import { multiselect } from '#tui/prompts/choices';
import { previousArray } from '#tui/form/builder/previous';
import { isSelectPromptOptions, parseSelectChoiceOptions, parseSelectStepName } from '#tui/form/builder/prompts/validators/select';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoiceOptions, MultiSelectPromptOptions } from '#tui/types';

export function multiselectFormStep<T>(this: FormBuilder, options: MultiSelectPromptOptions<T>, name?: string): FormBuilder;

export function multiselectFormStep<T>(
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

export function multiselectFormStep<T>(
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
	if (isSelectPromptOptions(optionsOrLabel)) {
		return this.add((_, previous) => multiselect<T>({ ...optionsOrLabel, default: previousArray(previous, optionsOrLabel.default ?? []) }), parseSelectStepName(optionsOrName));
	}

	return this.add(
		(_, previous) =>
			multiselect<T>({
				message: optionsOrLabel,
				options: parseSelectChoiceOptions<T>(optionsOrName),
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
