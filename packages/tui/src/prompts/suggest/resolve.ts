import { resolveSuggestionSource } from '#tui/prompts/suggest/validators/source';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const resolveSuggestions = async (source: SuggestOptions['options'], query: string): Promise<string[]> => {
	const resolved = await resolveSuggestionSource(source, query);

	if (!resolved.filter) {
		return [...resolved.options];
	}

	return resolved.options.filter((option) => option.toLowerCase().startsWith(query.toLowerCase()));
};
