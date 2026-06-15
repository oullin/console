import { confirm } from '#tui/prompts/choices';
import { previousBoolean } from '#tui/form/builder/previous';
import { isSelectPromptLabel } from '#tui/form/builder/prompts/validators/select';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ConfirmPromptOptions } from '#tui/types';

export function confirmFormStep(this: FormBuilder, options: ConfirmPromptOptions, name?: string): FormBuilder;

export function confirmFormStep(
	this: FormBuilder,
	label: string,
	defaultValue?: boolean,
	yes?: string,
	no?: string,
	required?: boolean | string,
	validate?: ConfirmPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: ConfirmPromptOptions['transform'],
): FormBuilder;

export function confirmFormStep(
	this: FormBuilder,
	optionsOrLabel: ConfirmPromptOptions | string,
	defaultValueOrName: boolean | string = true,
	yes = 'Yes',
	no = 'No',
	required: boolean | string = false,
	validate: ConfirmPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: ConfirmPromptOptions['transform'] = undefined,
): FormBuilder {
	if (!isSelectPromptLabel(optionsOrLabel)) {
		const formStepName = isSelectPromptLabel(defaultValueOrName) ? defaultValueOrName : undefined;

		return this.add((_, previous) => confirm({ ...optionsOrLabel, default: previousBoolean(previous, optionsOrLabel.default ?? true) }), formStepName);
	}

	return this.add((_, previous) => confirm(optionsOrLabel, previousBoolean(previous, defaultValueOrName as boolean), yes, no, required, validate, hint, transform), name);
}
