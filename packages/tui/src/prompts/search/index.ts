import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import { assertSearchOptions } from '#tui/prompts/search/validators/options';
import type { MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const search = async <T>(options: SearchPromptOptions<T>): Promise<T> => {
	assertSearchOptions(options);

	return promptUntilValid(options, async (attempt) => {
		const selected = await readSearchChoice(options, attempt);

		if (selected === undefined) {
			throw new PromptValidationError('Please select a valid option.');
		}

		return options.transform ? options.transform(selected) : selected;
	});
};

export const multisearch = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
	const promptOptions = { ...options, default: options.default ?? [] };

	return promptUntilValid(promptOptions, async () => {
		const selected = await readMultiSearchChoices(promptOptions);

		return promptOptions.transform ? promptOptions.transform(selected) : selected;
	});
};
