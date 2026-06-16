import type { MultiSearchChoiceQuery } from '#tui/prompts/search/read-multi/choice-query';
import type { MultiSearchHighlightState } from '#tui/prompts/search/read-multi/state/highlight';

export const applyMultiSearchTypedInput = async <T>(
	query: MultiSearchChoiceQuery<T>,
	highlighted: MultiSearchHighlightState<T>,
	key: string,
): Promise<{ cancelled: boolean }> => {
	const next = await query.applyTypedInput(key);

	highlighted.clear();

	return next;
};
