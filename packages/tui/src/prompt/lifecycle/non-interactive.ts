import { PromptValidationError } from '#tui/prompt/error';
import { validatedPromptValue } from '#tui/prompt/lifecycle/validation';
import type { BasePromptOptions } from '#tui/types';

export const resolveNonInteractivePrompt = async <T>(options: BasePromptOptions<T>): Promise<T> => {
	const value = options.default as T;

	const validation = await validatedPromptValue(options, value);

	if (validation) {
		throw new PromptValidationError(validation);
	}

	return value;
};
