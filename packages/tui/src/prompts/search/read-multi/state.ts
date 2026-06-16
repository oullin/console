import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { createInitialSearchSelection, displayedSearchChoices, markedSearchChoiceIndexes, toggleSearchChoices } from '#tui/prompts/search/selection';
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
	let query: TypedValueState = { cursor: 0, value: '' };

	let choices: Array<Choice<T>> = await resolveSearchChoices(options.options, query.value);

	let highlighted: number | null = null;

	const selected = createInitialSearchSelection(choices, options.default);
	const displayedChoices = (): Array<Choice<T>> => displayedSearchChoices(choices, selected, query.value);

	const resolveChoices = async (): Promise<void> => {
		choices = await resolveSearchChoices(options.options, query.value);
	};

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(query, key);

			if (next.cancelled) {
				return { cancelled: true };
			}

			query = { cursor: next.cursor, value: next.value };
			highlighted = null;

			await resolveChoices();

			return { cancelled: false };
		},
		displayedChoices,
		highlighted() {
			return highlighted;
		},
		markedChoiceIndexes() {
			return markedSearchChoiceIndexes(displayedChoices(), selected);
		},
		async move(action) {
			await resolveChoices();

			highlighted = moveSearchHighlight(displayedChoices(), highlighted, action, { scroll: options.scroll });
		},
		query() {
			return query;
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
};
