import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { createMultiSearchChoiceQuery } from '#tui/prompts/search/read-multi/choice-query';
import { createMultiSearchHighlightState } from '#tui/prompts/search/read-multi/state/highlight';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

import {
	createMultiSearchSelection,
	markedMultiSearchChoiceIndexes,
	multiSearchSelectedLabels,
	toggleAllDisplayedMultiSearchChoices,
	toggleHighlightedMultiSearchChoice,
} from '#tui/prompts/search/read-multi/state/selection';

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
	const initialChoices = await resolveSearchChoices(options.options, '');

	const selected = createMultiSearchSelection(initialChoices, options.default);
	const query = createMultiSearchChoiceQuery(options, selected, initialChoices);
	const highlighted = createMultiSearchHighlightState(options.scroll);

	return {
		async applyTypedInput(key) {
			const next = await query.applyTypedInput(key);

			highlighted.clear();

			return next;
		},
		displayedChoices,
		highlighted() {
			return highlighted.value();
		},
		markedChoiceIndexes() {
			return markedMultiSearchChoiceIndexes(displayedChoices(), selected);
		},
		async move(action) {
			await query.resolveChoices();

			highlighted.move(displayedChoices(), action);
		},
		query() {
			return query.value();
		},
		selected() {
			return selected;
		},
		selectedLabels() {
			return multiSearchSelectedLabels(selected);
		},
		toggleAllDisplayed() {
			toggleAllDisplayedMultiSearchChoices(selected, displayedChoices());
		},
		toggleHighlighted() {
			toggleHighlightedMultiSearchChoice(selected, displayedChoices(), highlighted.value());
		},
	};

	function displayedChoices(): Array<Choice<T>> {
		return query.displayedChoices();
	}
};
