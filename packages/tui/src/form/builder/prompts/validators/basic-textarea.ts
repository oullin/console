import { isBasicPromptOptions, parseBasicStepName } from '#tui/form/builder/prompts/validators/basic-label';
import type { TextareaPromptOptions } from '#tui/types';

export type ResolvedTextareaFormArguments = {
	name?: string;
	options: TextareaPromptOptions;
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
