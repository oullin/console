import { createMultiSearchReaderStateContext } from '#tui/prompts/search/read-multi/state/context';
import { applyMultiSearchTypedInput } from '#tui/prompts/search/read-multi/state/input';
import { selectedMultiSearchLabels } from '#tui/prompts/search/read-multi/state/labels';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

import {
	displayedMultiSearchChoices,
	markedDisplayedMultiSearchChoiceIndexes,
	moveDisplayedMultiSearchHighlight,
	toggleAllDisplayedMultiSearchSelection,
	toggleHighlightedDisplayedMultiSearchSelection,
} from '#tui/prompts/search/read-multi/state/displayed';

export type MultiSearchReaderState<T> = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean }>;
	displayedChoices(): Array<Choice<T>>;
	highlighted(): number | null;
	markedChoiceIndexes(): Set<number>;
	move(action: SearchNavigationAction): Promise<void>;
	query(): TypedValueState;
	selected(): SearchSelection<T>;
	selectedLabels(): string[];
	toggleAllDisplayed(): void;
	toggleHighlighted(): void;
};

export const createMultiSearchReaderState = async <T>(options: MultiSearchPromptOptions<T>): Promise<MultiSearchReaderState<T>> => {
	const { highlighted, query, selected } = await createMultiSearchReaderStateContext(options);

	return {
		async applyTypedInput(key) {
			return applyMultiSearchTypedInput(query, highlighted, key);
		},
		displayedChoices,
		highlighted() {
			return highlighted.value();
		},
		markedChoiceIndexes() {
			return markedDisplayedMultiSearchChoiceIndexes(query, selected);
		},
		async move(action) {
			await moveDisplayedMultiSearchHighlight(query, highlighted, action);
		},
		query() {
			return query.value();
		},
		selected() {
			return selected;
		},
		selectedLabels() {
			return selectedMultiSearchLabels(selected);
		},
		toggleAllDisplayed() {
			toggleAllDisplayedMultiSearchSelection(query, selected);
		},
		toggleHighlighted() {
			toggleHighlightedDisplayedMultiSearchSelection(query, selected, highlighted);
		},
	};

	function displayedChoices(): Array<Choice<T>> {
		return displayedMultiSearchChoices(query);
	}
};
