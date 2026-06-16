import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { renderSearchChoices } from '#tui/prompts/search/render';
import { createInitialSearchSelection, displayedSearchChoices, markedSearchChoiceIndexes, toggleSearchChoices } from '#tui/prompts/search/selection';
import { toggleHighlightedSearchChoice } from '#tui/prompts/search/read-multi/result';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

export type MultiSearchReaderSession<T> = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean }>;
	frame(): string;
	highlighted(): number | null;
	move(action: SearchNavigationAction): Promise<void>;
	query(): TypedValueState;
	render(): void;
	selected(): SearchSelection<T>;
	selectedLabels(): string[];
	toggleAllDisplayed(): void;
	toggleHighlighted(): void;
};

export const createMultiSearchReaderSession = async <T>(options: MultiSearchPromptOptions<T>): Promise<MultiSearchReaderSession<T>> => {
	let query: TypedValueState = { cursor: 0, value: '' };

	let choices: Array<Choice<T>> = await resolveSearchChoices(options.options, query.value);

	let highlighted: number | null = null;
	let frame = '';

	const selected = createInitialSearchSelection(choices, options.default);
	const currentChoices = (): Array<Choice<T>> => displayedSearchChoices(choices, selected, query.value);

	const resolveChoices = async (): Promise<void> => {
		choices = await resolveSearchChoices(options.options, query.value);
	};

	function render(): void {
		const displayed = currentChoices();
		const marked = markedSearchChoiceIndexes(displayed, selected);

		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		frame = renderSearchChoices(options.message, query.value, query.cursor, displayed, highlighted, marked, [...selected.values()], options.scroll, options.info, true, options.placeholder);
	}

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(query, key);

			if (next.cancelled) {
				return { cancelled: true };
			}

			query = { cursor: next.cursor, value: next.value };

			await resolveChoices();

			highlighted = null;
			render();

			return { cancelled: false };
		},
		frame() {
			return frame;
		},
		highlighted() {
			return highlighted;
		},
		async move(action) {
			await resolveChoices();

			highlighted = moveSearchHighlight(currentChoices(), highlighted, action, { scroll: options.scroll });
			render();
		},
		query() {
			return query;
		},
		render,
		selected() {
			return selected;
		},
		selectedLabels() {
			return [...selected.values()];
		},
		toggleAllDisplayed() {
			toggleSearchChoices(selected, currentChoices());
			render();
		},
		toggleHighlighted() {
			toggleHighlightedSearchChoice(selected, currentChoices(), highlighted);
			render();
		},
	};
};
