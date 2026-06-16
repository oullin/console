import { isSuggestionSourceCallback } from '#tui/prompts/suggest/validators/source';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const resolveSuggestions = async (source: SuggestOptions['options'], query: string): Promise<string[]> => {
	const isCallback = isSuggestionSourceCallback(source);
	const options = isCallback ? await source(query) : source;

	if (isCallback) {
		return [...options];
	}

	return options.filter((option: string) => option.toLowerCase().startsWith(query.toLowerCase()));
};
