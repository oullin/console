import { textarea } from '#tui/prompts/basic';
import { previousString } from '#tui/form/builder/previous';
import { isBasicPromptOptions, parseBasicStepName } from '#tui/form/builder/prompts/validators/basic';
import type { FormBuilder } from '#tui/form/builder/index';
import type { TextareaPromptOptions } from '#tui/types';

export function textareaFormStep(this: FormBuilder, options: TextareaPromptOptions, name?: string): FormBuilder;

export function textareaFormStep(
	this: FormBuilder,
	label: string,
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextareaPromptOptions['validate'],
	hint?: string,
	rows?: number,
	name?: string,
	transform?: TextareaPromptOptions['transform'],
): FormBuilder;

export function textareaFormStep(
	this: FormBuilder,
	optionsOrLabel: TextareaPromptOptions | string,
	placeholder = '',
	defaultValue = '',
	required: TextareaPromptOptions['required'] = false,
	validate: TextareaPromptOptions['validate'] = undefined,
	hint = '',
	rows = 5,
	name?: string,
	transform: TextareaPromptOptions['transform'] = undefined,
): FormBuilder {
	if (isBasicPromptOptions(optionsOrLabel)) {
		return this.add((_, previous) => textarea({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), parseBasicStepName(placeholder));
	}

	return this.add((_, previous) => textarea(optionsOrLabel, placeholder, previousString(previous, defaultValue), required, validate, hint, rows, transform), name);
}
