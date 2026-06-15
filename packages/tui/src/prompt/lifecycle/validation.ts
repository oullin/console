import { ensureRequired, validationMessage } from '#tui/prompt/validation';
import type { BasePromptOptions } from '#tui/types';

export const validatedPromptValue = async <T>(options: BasePromptOptions<T>, value: T): Promise<string | undefined> => {
	return ensureRequired(value, options.required) ?? (await validationMessage(value, options.validate, options));
};
