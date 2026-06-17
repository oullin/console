import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { createMultiSearchChoiceQuery } from '#tui/prompts/search/read-multi/choice-query';
import { createMultiSearchHighlightState } from '#tui/prompts/search/read-multi/state/highlight';
import { createMultiSearchSelection } from '#tui/prompts/search/read-multi/state/selection';
import type { MultiSearchChoiceQuery } from '#tui/prompts/search/read-multi/choice-query';
import type { MultiSearchHighlightState } from '#tui/prompts/search/read-multi/state/highlight';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { MultiSearchPromptOptions } from '#tui/types';

export type MultiSearchReaderStateContext<T> = {
	highlighted: MultiSearchHighlightState<T>;
	query: MultiSearchChoiceQuery<T>;
	selected: SearchSelection<T>;
};

export const createMultiSearchReaderStateContext = async <T>(options: MultiSearchPromptOptions<T>): Promise<MultiSearchReaderStateContext<T>> => {
	const initialChoices = await resolveSearchChoices(options.options, '');

	const selected = createMultiSearchSelection(initialChoices, options.default);

	return {
		highlighted: createMultiSearchHighlightState(options.scroll),
		query: createMultiSearchChoiceQuery(options, selected, initialChoices),
		selected,
	};
};
