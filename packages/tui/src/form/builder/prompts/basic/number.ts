import { number } from '#tui/prompts/basic';
import { previousNumber } from '#tui/form/builder/previous';
import { isBasicPromptLabel } from '#tui/form/builder/prompts/validators/basic';
import { hasPromptDefault } from '#tui/validators/default';
import type { FormBuilder } from '#tui/form/builder/index';
import type { NumberPromptOptions } from '#tui/types';

const hasPreviousResponse = (previous: unknown): boolean => previous !== undefined && previous !== null;

const numberOptionsWithPreviousDefault = (options: NumberPromptOptions, previous: unknown): NumberPromptOptions => {
	if (hasPreviousResponse(previous)) {
		return { ...options, default: previousNumber(previous, options.default ?? '') };
	}

	if (hasPromptDefault(options)) {
		return { ...options, default: previousNumber(previous, options.default ?? '') };
	}

	return options;
};

export function numberFormStep(this: FormBuilder, options: NumberPromptOptions, name?: string): FormBuilder;

export function numberFormStep(
	this: FormBuilder,
	label: string,
	placeholder?: string,
	defaultValue?: number | string,
	required?: boolean | string,
	validate?: NumberPromptOptions['validate'],
	hint?: string,
	min?: number,
	max?: number,
	step?: number,
	name?: string,
	transform?: NumberPromptOptions['transform'],
): FormBuilder;

export function numberFormStep(
	this: FormBuilder,
	optionsOrLabel: NumberPromptOptions | string,
	placeholder = '',
	defaultValue: number | string = '',
	required: NumberPromptOptions['required'] = false,
	validate: NumberPromptOptions['validate'] = undefined,
	hint = '',
	min?: number,
	max?: number,
	step?: number,
	name?: string,
	transform: NumberPromptOptions['transform'] = undefined,
): FormBuilder {
	const hasLabelDefault = isBasicPromptLabel(optionsOrLabel) && arguments.length >= 3 && defaultValue !== undefined;

	if (!isBasicPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => number(numberOptionsWithPreviousDefault(optionsOrLabel, previous)), placeholder);
	}

	return this.add((_, previous) => {
		const promptOptions: NumberPromptOptions = {
			message: optionsOrLabel,
			label: optionsOrLabel,
			placeholder,
			required,
			validate,
			hint,
			min,
			max,
			step,
			transform,
		};

		if (hasPreviousResponse(previous) || hasLabelDefault) {
			promptOptions.default = previousNumber(previous, hasLabelDefault ? defaultValue : '');
		}

		return number(promptOptions);
	}, name);
}
