import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import type { MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const search = async <T>(options: SearchPromptOptions<T>): Promise<T> => {
	return promptUntilValid(options, async (attempt) => {
		const selected = await readSearchChoice(options, attempt);

		if (selected === undefined) {
			throw new PromptValidationError('Please select a valid option.');
		}

		return selected;
	});
};

export const multisearch = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
	return promptUntilValid(options, async () => readMultiSearchChoices(options));
};
