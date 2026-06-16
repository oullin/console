import { z } from 'zod';
import type { NumberPromptOptions, TextareaPromptOptions, TextPromptOptions } from '#tui/types';

const basicPromptLabelSchema = z.string();

export type ResolvedTextFormArguments = {
	name?: string;
	options: TextPromptOptions;
};

export type ResolvedTextareaFormArguments = {
	name?: string;
	options: TextareaPromptOptions;
};

export type ResolvedNumberFormArguments =
	| {
			kind: 'options';
			name?: string;
			options: NumberPromptOptions;
	  }
	| {
			defaultValue: number | string;
			hasLabelDefault: boolean;
			hint: string;
			kind: 'label';
			label: string;
			max?: number;
			min?: number;
			name?: string;
			placeholder: string;
			required: NumberPromptOptions['required'];
			step?: number;
			transform: NumberPromptOptions['transform'];
			validate: NumberPromptOptions['validate'];
	  };

export const isBasicPromptLabel = (value: unknown): value is string => {
	return basicPromptLabelSchema.safeParse(value).success;
};

export const parseBasicStepName = (value: unknown): string | undefined => {
	const parsed = basicPromptLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const isBasicPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isBasicPromptLabel(value);
};

export const resolveTextFormArguments = (
	optionsOrLabel: TextPromptOptions | string,
	placeholder = '',
	defaultValue = '',
	required: TextPromptOptions['required'] = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): ResolvedTextFormArguments => {
	if (isBasicPromptOptions(optionsOrLabel)) {
		return {
			name: parseBasicStepName(placeholder),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			placeholder,
			default: defaultValue,
			required,
			validate,
			hint,
			transform,
		},
	};
};

export const resolveTextareaFormArguments = (
	optionsOrLabel: TextareaPromptOptions | string,
	placeholder = '',
	defaultValue = '',
	required: TextareaPromptOptions['required'] = false,
	validate: TextareaPromptOptions['validate'] = undefined,
	hint = '',
	rows = 5,
	name?: string,
	transform: TextareaPromptOptions['transform'] = undefined,
): ResolvedTextareaFormArguments => {
	if (isBasicPromptOptions(optionsOrLabel)) {
		return {
			name: parseBasicStepName(placeholder),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			placeholder,
			default: defaultValue,
			required,
			validate,
			hint,
			rows,
			transform,
		},
	};
};

export const resolvePasswordFormArguments = (
	optionsOrLabel: TextPromptOptions | string,
	placeholder = '',
	required: TextPromptOptions['required'] = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
): ResolvedTextFormArguments => {
	if (isBasicPromptOptions(optionsOrLabel)) {
		return {
			name: parseBasicStepName(placeholder),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			placeholder,
			default: '',
			required,
			validate,
			hint,
			transform,
		},
	};
};

export const resolveNumberFormArguments = (
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
	argumentCount = 0,
): ResolvedNumberFormArguments => {
	if (isBasicPromptOptions(optionsOrLabel)) {
		return {
			kind: 'options',
			name: parseBasicStepName(placeholder),
			options: optionsOrLabel,
		};
	}

	return {
		defaultValue,
		hasLabelDefault: isBasicPromptLabel(optionsOrLabel) && argumentCount >= 3 && defaultValue !== undefined,
		hint,
		kind: 'label',
		label: optionsOrLabel,
		max,
		min,
		name,
		placeholder,
		required,
		step,
		transform,
		validate,
	};
};
