import { ask } from '#tui/prompt';
import { resolveLineMultiSearchChoices } from '#tui/prompts/search/line-mode';
import { toggleSearchChoice } from '#tui/prompts/search/selection';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

export const selectedSearchValues = <T>(selected: SearchSelection<T>): T[] => [...selected.keys()];

export const lineMultiSearchValues = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
	const query = (await ask(options.message, options.hint)).trim();

	return resolveLineMultiSearchChoices(options, query);
};

export const toggleHighlightedSearchChoice = <T>(selected: SearchSelection<T>, choices: Array<Choice<T>>, highlighted: number | null): void => {
	if (highlighted === null) {
		return;
	}

	const choice = choices[highlighted];

	if (choice) {
		toggleSearchChoice(selected, choice);
	}
};
