import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { initialRetriedSearchHighlight } from '#tui/prompts/search/navigation';
import { defaultSearchChoice, selectedSearchValue } from '#tui/prompts/search/read-single/result';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchReaderSelection, SearchReadOptions } from '#tui/prompts/search/read-single/types';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice } from '#tui/types';

export type SingleSearchReaderState<T> = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean }>;
	choices(): Array<Choice<T>>;
	clearHighlight(): void;
	defaultSelection(): Promise<SearchReaderSelection<T>>;
	highlighted(): number | null;
	move(action: SearchNavigationAction): Promise<void>;
	query(): TypedValueState;
	selectedSelection(): SearchReaderSelection<T>;
};

export const createSingleSearchReaderState = async <T>(options: SearchReadOptions<T>, attempt: number): Promise<SingleSearchReaderState<T>> => {
	let query: TypedValueState = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, query.value);

	let highlighted: number | null = initialRetriedSearchHighlight(choices, attempt);

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
		choices() {
			return choices;
		},
		clearHighlight() {
			highlighted = null;
		},
		async defaultSelection() {
			await resolveChoices();

			if (query.value !== '' || options.hasDefault !== true) {
				return { label: '', submitted: false, value: undefined };
			}

			const choice = defaultSearchChoice(choices, options.default, options.hasDefault);

			return { label: choice?.label ?? '', submitted: choice !== undefined, value: choice?.value ?? options.default };
		},
		highlighted() {
			return highlighted;
		},
		async move(action) {
			await resolveChoices();

			highlighted = moveSearchHighlight(choices, highlighted, action, { attempt, retryFirst: true, scroll: options.scroll });
		},
		query() {
			return query;
		},
		selectedSelection() {
			const choice = highlighted === null ? undefined : choices[highlighted];
			const value = selectedSearchValue(choices, highlighted);

			return { label: choice?.label ?? '', submitted: choice !== undefined && value !== undefined, value };
		},
	};
};
