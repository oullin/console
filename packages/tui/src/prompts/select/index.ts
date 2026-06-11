export { confirm } from '#tui/prompts/select/confirm';

import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { normalizeChoices } from '#tui/concerns/choices';
import { readMultipleChoices } from '#tui/prompts/select/read-multiple';
import { readSelectedChoice } from '#tui/prompts/select/read-selected';
import type { MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

export const select = async <T>(options: SelectPromptOptions<T>): Promise<T> => {
	const choices = normalizeChoices(options.options);

	return promptUntilValid(options, async () => {
		return readSelectedChoice(options.message, choices, options.default, options.hint, options.scroll, options.info).catch((error: unknown) => {
			if (options.default !== undefined && error instanceof PromptValidationError) {
				return options.default;
			}

			throw error;
		});
	});
};

export const multiselect = async <T>(options: MultiSelectPromptOptions<T>): Promise<T[]> => {
	const choices = normalizeChoices(options.options);

	return promptUntilValid(options, async () => readMultipleChoices(options.message, choices, options.default, options.hint, options.scroll, options.info));
};
