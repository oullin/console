import { previousNumber } from '#tui/form/builder/previous';
import { hasPromptDefault } from '#tui/validators/default';
import type { NumberPromptOptions } from '#tui/types';

export const hasPreviousNumberResponse = (previous: unknown): boolean => previous !== undefined && previous !== null;

export const numberOptionsWithPreviousDefault = (options: NumberPromptOptions, previous: unknown): NumberPromptOptions => {
	if (hasPreviousNumberResponse(previous)) {
		return { ...options, default: previousNumber(previous, options.default ?? '') };
	}

	if (hasPromptDefault(options)) {
		return { ...options, default: previousNumber(previous, options.default ?? '') };
	}

	return options;
};

export const previousNumberDefault = (previous: unknown, fallback: number | string): number | string => {
	return previousNumber(previous, fallback);
};
