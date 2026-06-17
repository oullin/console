import { suggest } from '#tui/prompts/choices';
import { previousString } from '#tui/form/builder/previous';
import { resolveSuggestFormArguments } from '#tui/form/builder/prompts/validators/suggest';
import type { FormBuilder } from '#tui/form/builder/index';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { TextPromptOptions } from '#tui/types';

export function suggestFormStep(this: FormBuilder, options: SuggestOptions, name?: string): FormBuilder;

export function suggestFormStep(
	this: FormBuilder,
	label: string,
	options: SuggestOptions['options'],
	placeholder?: string,
	defaultValue?: string,
	scroll?: number,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: TextPromptOptions['transform'],
	info?: SuggestOptions['info'],
): FormBuilder;

export function suggestFormStep(
	this: FormBuilder,
	optionsOrLabel: SuggestOptions | string,
	options?: SuggestOptions['options'] | string,
	placeholder = '',
	defaultValue = '',
	scroll = 5,
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
	info: SuggestOptions['info'] = '',
): FormBuilder {
	const resolved = resolveSuggestFormArguments(optionsOrLabel, options, placeholder, defaultValue, scroll, required, validate, hint, name, transform, info);

	return this.add((_, previous) => suggest({ ...resolved.options, default: previousString(previous, resolved.options.default ?? '') }), resolved.name);
}
