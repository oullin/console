import { number, password, text, textarea } from '#tui/prompts/basic';
import { previousNumber, previousString } from '#tui/form/builder/previous';
import { isBasicPromptLabel } from '#tui/form/builder/prompts/validators/basic';
import type { FormBuilder } from '#tui/form/builder/index';
import type { BasicPromptBuilderMethods } from '#tui/form/builder/prompts/types';
import type { NumberPromptOptions, TextareaPromptOptions, TextPromptOptions } from '#tui/types';

function numberFormStep(this: FormBuilder, options: NumberPromptOptions, name?: string): FormBuilder;
function numberFormStep(
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

function numberFormStep(
	this: FormBuilder,
	optionsOrLabel: NumberPromptOptions | string,
	placeholder = '',
	defaultValue: number | string = 0,
	required: NumberPromptOptions['required'] = false,
	validate: NumberPromptOptions['validate'] = undefined,
	hint = '',
	min?: number,
	max?: number,
	step?: number,
	name?: string,
	transform: NumberPromptOptions['transform'] = undefined,
): FormBuilder {
	if (!isBasicPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => number({ ...optionsOrLabel, default: previousNumber(previous, optionsOrLabel.default ?? 0) }), placeholder);
	}

	return this.add((_, previous) => number(optionsOrLabel, placeholder, previousNumber(previous, defaultValue), required, validate, hint, min, max, step, transform), name);
}

function passwordFormStep(this: FormBuilder, options: TextPromptOptions, name?: string): FormBuilder;
function passwordFormStep(
	this: FormBuilder,
	label: string,
	placeholder?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	name?: string,
	transform?: TextPromptOptions['transform'],
): FormBuilder;

function passwordFormStep(
	this: FormBuilder,
	optionsOrLabel: TextPromptOptions | string,
	placeholder = '',
	required: TextPromptOptions['required'] = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): FormBuilder {
	if (!isBasicPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => password({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), placeholder);
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

function textFormStep(this: FormBuilder, options: TextPromptOptions, name?: string): FormBuilder;
function textFormStep(
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

function textFormStep(
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
	if (!isBasicPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => text({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), placeholder);
	}

	return this.add((_, previous) => text(optionsOrLabel, placeholder, previousString(previous, defaultValue), required, validate, hint, transform), name);
}

function textareaFormStep(this: FormBuilder, options: TextareaPromptOptions, name?: string): FormBuilder;
function textareaFormStep(
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

function textareaFormStep(
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
	if (!isBasicPromptLabel(optionsOrLabel)) {
		return this.add((_, previous) => textarea({ ...optionsOrLabel, default: previousString(previous, optionsOrLabel.default ?? '') }), placeholder);
	}

	return this.add((_, previous) => textarea(optionsOrLabel, placeholder, previousString(previous, defaultValue), required, validate, hint, rows, transform), name);
}

export const basicPromptBuilderMethods: BasicPromptBuilderMethods & ThisType<FormBuilder> = {
	number: numberFormStep,
	password: passwordFormStep,
	text: textFormStep,
	textarea: textareaFormStep,
};
