import { hasNumberDefaultArgument, isNumberPromptLabel, parseNumberDefault } from '#tui/prompts/number/validators/overload';
import { hasPromptDefault } from '#tui/validators/default';
import type { NormalizedNumberPromptOptions } from '#tui/prompts/number/defaults';
import type { NumberPromptOptions } from '#tui/types';

export type NumberPromptArgumentOptions = {
	defaultValue: number | string;
	hasDefaultArgument: boolean;
	hint: string;
	max?: number;
	message: string | NumberPromptOptions;
	min?: number;
	placeholder: string;
	required: boolean | string;
	step?: number;
	transform?: NumberPromptOptions['transform'];
	validate?: NumberPromptOptions['validate'];
};

export const normalizeNumberPromptOptions = (options: NumberPromptArgumentOptions): NormalizedNumberPromptOptions => {
	const isLabel = isNumberPromptLabel(options.message);
	const hasDefault = isLabel ? hasNumberDefaultArgument(options.hasDefaultArgument, options.defaultValue) : hasPromptDefault(options.message);

	if (!isLabel) {
		return {
			...options.message,
			default: hasDefault ? parseNumberDefault(options.message.default, '') : '',
			hasDefault,
		};
	}

	return {
		default: hasDefault ? options.defaultValue : '',
		hasDefault,
		hint: options.hint,
		label: options.message,
		max: options.max,
		message: options.message,
		min: options.min,
		placeholder: options.placeholder,
		required: options.required,
		step: options.step,
		transform: options.transform,
		validate: options.validate,
	};
};
