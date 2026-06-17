import { text } from '#tui/prompts/basic';
import { previousString } from '#tui/form/builder/previous';
import { resolveTextFormArguments } from '#tui/form/builder/prompts/validators/basic';
import type { FormBuilder } from '#tui/form/builder/index';
import type { TextPromptOptions } from '#tui/types';

export function textFormStep(this: FormBuilder, options: TextPromptOptions, name?: string): FormBuilder;

export function textFormStep(
	this: FormBuilder,
	label: string,
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: TextPromptOptions['transform'],
): FormBuilder;

export function textFormStep(
	this: FormBuilder,
	optionsOrLabel: TextPromptOptions | string,
	placeholder = '',
	defaultValue = '',
	required: TextPromptOptions['required'] = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): FormBuilder {
	const resolved = resolveTextFormArguments(optionsOrLabel, placeholder, defaultValue, required, validate, hint, name, transform);

	return this.add((_, previous) => text({ ...resolved.options, default: previousString(previous, resolved.options.default ?? '') }), resolved.name);
}
