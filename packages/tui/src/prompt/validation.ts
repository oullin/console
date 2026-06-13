import { requiredMessage } from '#tui/validators/required';
import { parseValidationResult } from '#tui/validators/result';
import { globalValidationMessage } from '#tui/prompt/validate-using';
import type { BasePromptOptions, Validator } from '#tui/types';

export const validationMessage = async <T>(value: T, validator?: Validator<T>, options?: BasePromptOptions<T>): Promise<string | undefined> => {
	const result = parseValidationResult(validator ? await validator(value) : options ? await globalValidationMessage(value, options) : undefined);

	if (result !== undefined && result !== null && result.length > 0) {
		return result;
	}

	return undefined;
};

export const ensureRequired = <T>(value: T, required?: boolean | string): string | undefined => {
	return requiredMessage(value, required);
};
