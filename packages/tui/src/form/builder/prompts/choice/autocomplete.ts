import { autocomplete } from '#tui/prompts/choices';
import { previousString } from '#tui/form/builder/previous';
import { isSuggestPromptLabel, parseSuggestSource, parseSuggestStepName } from '#tui/form/builder/prompts/validators/suggest';
import type { FormBuilder } from '#tui/form/builder/index';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { TextPromptOptions } from '#tui/types';

export function autocompleteFormStep(this: FormBuilder, options: SuggestOptions, name?: string): FormBuilder;

export function autocompleteFormStep(
	this: FormBuilder,
	label: string,
	options: SuggestOptions['options'],
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: TextPromptOptions['transform'],
	info?: SuggestOptions['info'],
): FormBuilder;

export function autocompleteFormStep(
	this: FormBuilder,
	optionsOrLabel: SuggestOptions | string,
	options?: SuggestOptions['options'] | string,
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
	info: SuggestOptions['info'] = '',
): FormBuilder {
	if (!isSuggestPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => autocomplete({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), parseSuggestStepName(options));
	}

	return this.add(
		(_, previous) =>
			autocomplete({
				message: optionsOrLabel,
				label: optionsOrLabel,
				options: parseSuggestSource(options),
				placeholder,
				default: previousString(previous, defaultValue),
				required,
				validate,
				hint,
				transform,
				info,
			}),
		name,
	);
}
