import { labelNumberOptions } from '#tui/form/builder/prompts/basic/number/options';
import { runLabelNumberFormStep, runObjectNumberFormStep } from '#tui/form/builder/prompts/basic/number/step';
import { isBasicPromptLabel } from '#tui/form/builder/prompts/validators/basic';
import type { FormBuilder } from '#tui/form/builder/index';
import type { NumberPromptOptions } from '#tui/types';

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
		return this.add((_, previous) => runObjectNumberFormStep(optionsOrLabel, previous), placeholder);
	}

	return this.add((_, previous) => {
		const promptOptions = labelNumberOptions({
			defaultValue,
			hasLabelDefault,
			hint,
			label: optionsOrLabel,
			max,
			min,
			placeholder,
			previous,
			required,
			step,
			transform,
			validate,
		});

		return runLabelNumberFormStep(promptOptions);
	}, name);
}
