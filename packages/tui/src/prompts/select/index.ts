export { confirm } from '#tui/prompts/select/confirm';

import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { normalizeChoices } from '#tui/concerns/choices';
import { readMultipleChoices } from '#tui/prompts/select/read-multiple';
import { readSelectedChoice } from '#tui/prompts/select/read-selected';
import { assertSelectOptions } from '#tui/prompts/select/validators/options';
import type { MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

export const select = async <T>(options: SelectPromptOptions<T>): Promise<T> => {
	assertSelectOptions(options);

	const promptOptions = { ...options, required: options.required ?? true };
	const choices = normalizeChoices(options.options);

	return promptUntilValid(promptOptions, async () => {
		const selected = await readSelectedChoice(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info).catch((error: unknown) => {
			if (promptOptions.default !== undefined && error instanceof PromptValidationError) {
				return promptOptions.default;
			}

			throw error;
		});

		return promptOptions.transform ? promptOptions.transform(selected) : selected;
	});
};

export const multiselect = async <T>(options: MultiSelectPromptOptions<T>): Promise<T[]> => {
	const promptOptions = { ...options, default: options.default ?? [] };
	const choices = normalizeChoices(options.options);

	return promptUntilValid(promptOptions, async () => {
		const selected = await readMultipleChoices(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info);

		return promptOptions.transform ? promptOptions.transform(selected) : selected;
	});
};
