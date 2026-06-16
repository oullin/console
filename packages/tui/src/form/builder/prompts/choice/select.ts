import { select } from '#tui/prompts/choices';
import { previousValue } from '#tui/form/builder/previous';
import { isSelectPromptOptions, parseSelectChoiceOptions, parseSelectStepName } from '#tui/form/builder/prompts/validators/select';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoiceOptions, SelectPromptOptions } from '#tui/types';

export function selectFormStep<T>(this: FormBuilder, options: SelectPromptOptions<T>, name?: string): FormBuilder;

export function selectFormStep<T>(
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

export function selectFormStep<T>(
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
	if (isSelectPromptOptions(optionsOrLabel)) {
		return this.add((_, previous) => select<T>({ ...optionsOrLabel, default: previousValue(previous, optionsOrLabel.default) }), parseSelectStepName(optionsOrName));
	}

	return this.add(
		(_, previous) =>
			select<T>({
				message: optionsOrLabel,
				options: parseSelectChoiceOptions<T>(optionsOrName),
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
