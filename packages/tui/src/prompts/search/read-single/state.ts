import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { initialRetriedSearchHighlight } from '#tui/prompts/search/navigation';
import { createSingleSearchChoiceQuery } from '#tui/prompts/search/read-single/choice-query';
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
	const initialChoices = await resolveSearchChoices(options.options, '');

	const query = createSingleSearchChoiceQuery(options, initialChoices);

	let highlighted: number | null = initialRetriedSearchHighlight(initialChoices, attempt);

	return {
		async applyTypedInput(key) {
			const next = await query.applyTypedInput(key);

			highlighted = null;

			return next;
		},
		choices() {
			return query.choices();
		},
		clearHighlight() {
			highlighted = null;
		},
		async defaultSelection() {
			await query.resolveChoices();

			if (query.value().value !== '' || options.hasDefault !== true) {
				return { label: '', submitted: false, value: undefined };
			}

			const choice = defaultSearchChoice(query.choices(), options.default, options.hasDefault);

			return { label: choice?.label ?? '', submitted: choice !== undefined, value: choice?.value ?? options.default };
		},
		highlighted() {
			return highlighted;
		},
		async move(action) {
			await query.resolveChoices();

			highlighted = moveSearchHighlight(query.choices(), highlighted, action, { attempt, retryFirst: true, scroll: options.scroll });
		},
		query() {
			return query.value();
		},
		selectedSelection() {
			const choices = query.choices();
			const choice = highlighted === null ? undefined : choices[highlighted];
			const value = selectedSearchValue(choices, highlighted);

			return { label: choice?.label ?? '', submitted: choice !== undefined && value !== undefined, value };
		},
	};
};
