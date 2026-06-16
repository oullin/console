import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { createInitialSearchSelection, markedSearchChoiceIndexes, toggleSearchChoices } from '#tui/prompts/search/selection';
import { createMultiSearchChoiceQuery } from '#tui/prompts/search/read-multi/choice-query';
import { toggleHighlightedSearchChoice } from '#tui/prompts/search/read-multi/result';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

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

	const selected = createInitialSearchSelection(initialChoices, options.default);
	const query = createMultiSearchChoiceQuery(options, selected, initialChoices);

	let highlighted: number | null = null;

	return {
		async applyTypedInput(key) {
			const next = await query.applyTypedInput(key);

			highlighted = null;

			return next;
		},
		displayedChoices,
		highlighted() {
			return highlighted;
		},
		markedChoiceIndexes() {
			return markedSearchChoiceIndexes(displayedChoices(), selected);
		},
		async move(action) {
			await query.resolveChoices();

			highlighted = moveSearchHighlight(displayedChoices(), highlighted, action, { scroll: options.scroll });
		},
		query() {
			return query.value();
		},
		selected() {
			return selected;
		},
		selectedLabels() {
			return [...selected.values()];
		},
		toggleAllDisplayed() {
			toggleSearchChoices(selected, displayedChoices());
		},
		toggleHighlighted() {
			toggleHighlightedSearchChoice(selected, displayedChoices(), highlighted);
		},
	};

	function displayedChoices(): Array<Choice<T>> {
		return query.displayedChoices();
	}
};
