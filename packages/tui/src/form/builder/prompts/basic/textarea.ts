import { textarea } from '#tui/prompts/basic';
import { previousString } from '#tui/form/builder/previous';
import { resolveTextareaFormArguments } from '#tui/form/builder/prompts/validators/basic';
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
	const resolved = resolveTextareaFormArguments(optionsOrLabel, placeholder, defaultValue, required, validate, hint, rows, name, transform);

	return this.add((_, previous) => textarea({ ...resolved.options, default: previousString(previous, resolved.options.default ?? '') }), resolved.name);
}
