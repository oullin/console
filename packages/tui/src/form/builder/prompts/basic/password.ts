import { password } from '#tui/prompts/basic';
import { previousString } from '#tui/form/builder/previous';
import { isBasicPromptOptions, parseBasicStepName } from '#tui/form/builder/prompts/validators/basic';
import type { FormBuilder } from '#tui/form/builder/index';
import type { TextPromptOptions } from '#tui/types';

export function passwordFormStep(this: FormBuilder, options: TextPromptOptions, name?: string): FormBuilder;

export function passwordFormStep(
	this: FormBuilder,
	label: string,
	placeholder?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: TextPromptOptions['transform'],
): FormBuilder;

export function passwordFormStep(
	this: FormBuilder,
	optionsOrLabel: TextPromptOptions | string,
	placeholder = '',
	required: TextPromptOptions['required'] = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): FormBuilder {
	if (isBasicPromptOptions(optionsOrLabel)) {
		return this.add((_, previous) => password({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), parseBasicStepName(placeholder));
	}

	return this.add(
		(_, previous) =>
			password({
				message: optionsOrLabel,
				label: optionsOrLabel,
				placeholder,
				default: previousString(previous, ''),
				required,
				validate,
				hint,
				transform,
			}),
		name,
	);
}
