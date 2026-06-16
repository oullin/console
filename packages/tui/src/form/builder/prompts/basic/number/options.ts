import { hasPreviousNumberResponse, previousNumberDefault } from '#tui/form/builder/prompts/basic/number/defaults';
import type { NumberPromptOptions } from '#tui/types';

type LabelNumberOptionsInput = {
	defaultValue: number | string;
	hasLabelDefault: boolean;
	hint: string;
	label: string;
	max?: number;
	min?: number;
	placeholder: string;
	previous: unknown;
	required: NumberPromptOptions['required'];
	step?: number;
	transform: NumberPromptOptions['transform'];
	validate: NumberPromptOptions['validate'];
};

export const labelNumberOptions = ({
	defaultValue,
	hasLabelDefault,
	hint,
	label,
	max,
	min,
	placeholder,
	previous,
	required,
	step,
	transform,
	validate,
}: LabelNumberOptionsInput): NumberPromptOptions => {
	const options: NumberPromptOptions = {
		message: label,
		label,
		placeholder,
		required,
		validate,
		hint,
		min,
		max,
		step,
		transform,
	};

	if (hasPreviousNumberResponse(previous)) {
		options.default = previousNumberDefault(previous, hasLabelDefault ? defaultValue : '');
	} else if (hasLabelDefault) {
		options.default = previousNumberDefault(previous, defaultValue);
	}

	return options;
};
