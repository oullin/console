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
	const hasDefault = typeof options.message === 'string' ? options.hasDefaultArgument && options.defaultValue !== undefined : hasPromptDefault(options.message);

	if (typeof options.message !== 'string') {
		return {
			...options.message,
			default: hasDefault ? (options.message.default as number | string) : '',
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
