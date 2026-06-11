import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const resolveSuggestions = async (source: SuggestOptions['options'], query: string): Promise<string[]> => {
	const options = typeof source === 'function' ? await source(query) : source;

	if (typeof source === 'function') {
		return [...options];
	}

	return options.filter((option: string) => option.toLowerCase().startsWith(query.toLowerCase()));
};
