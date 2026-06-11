import { requiredMessage } from '#tui/validators/required';
import { parseValidationResult } from '#tui/validators/result';
import type { Validator } from '#tui/types';

export const validationMessage = async <T>(value: T, validator?: Validator<T>): Promise<string | undefined> => {
	const result = parseValidationResult(await validator?.(value));

	if (result !== undefined && result !== null && result.length > 0) {
		return result;
	}

	return undefined;
};

export const ensureRequired = <T>(value: T, required?: boolean | string): string | undefined => {
	return requiredMessage(value, required);
};
