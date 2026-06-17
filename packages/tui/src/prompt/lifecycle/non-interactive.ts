import { PromptValidationError } from '#tui/prompt/error';
import { validatedPromptValue } from '#tui/prompt/lifecycle/validation';
import { parsePromptDefault } from '#tui/validators/default';
import type { BasePromptOptions } from '#tui/types';

export const resolveNonInteractivePrompt = async <T>(options: BasePromptOptions<T>): Promise<T> => {
	const value = parsePromptDefault<T>(options.default);

	const validation = await validatedPromptValue(options, value);

	if (validation) {
		throw new PromptValidationError(validation);
	}

	return value;
};
