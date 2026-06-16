import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { initialRetriedSearchHighlight } from '#tui/prompts/search/navigation';
import { defaultSearchChoice, selectedSearchValue } from '#tui/prompts/search/read-single/result';
import { renderSearchChoices } from '#tui/prompts/search/render';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice, SearchPromptOptions } from '#tui/types';

export type SearchReadOptions<T> = SearchPromptOptions<T> & {
	hasDefault?: boolean;
};

export type SearchReaderSelection<T> = {
	label: string;
	submitted: boolean;
	value: T | undefined;
};

export type SearchReaderSession<T> = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean }>;
	choices(): Array<Choice<T>>;
	clearHighlight(): void;
	defaultSelection(): Promise<SearchReaderSelection<T>>;
	frame(): string;
	highlighted(): number | null;
	move(action: SearchNavigationAction): Promise<void>;
	query(): TypedValueState;
	render(): void;
	selectedSelection(): SearchReaderSelection<T>;
};

export const createSearchReaderSession = async <T>(options: SearchReadOptions<T>, attempt: number): Promise<SearchReaderSession<T>> => {
	let query: TypedValueState = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, query.value);

	let highlighted: number | null = initialRetriedSearchHighlight(choices, attempt);
	let frame = '';

	const resolveChoices = async (): Promise<void> => {
		choices = await resolveSearchChoices(options.options, query.value);
	};

	function render(): void {
		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		frame = renderSearchChoices(options.message, query.value, query.cursor, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
	}

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(query, key);

			if (next.cancelled) {
				return { cancelled: true };
			}

			query = { cursor: next.cursor, value: next.value };
			highlighted = null;

			await resolveChoices();

			render();

			return { cancelled: false };
		},
		choices() {
			return choices;
		},
		clearHighlight() {
			highlighted = null;
			render();
		},
		async defaultSelection() {
			await resolveChoices();

			if (query.value !== '' || options.hasDefault !== true) {
				return { label: '', submitted: false, value: undefined };
			}

			const choice = defaultSearchChoice(choices, options.default, options.hasDefault);

			return { label: choice?.label ?? '', submitted: choice !== undefined, value: choice?.value ?? options.default };
		},
		frame() {
			return frame;
		},
		highlighted() {
			return highlighted;
		},
		async move(action) {
			await resolveChoices();

			highlighted = moveSearchHighlight(choices, highlighted, action, { attempt, retryFirst: true, scroll: options.scroll });
			render();
		},
		query() {
			return query;
		},
		render,
		selectedSelection() {
			const choice = highlighted === null ? undefined : choices[highlighted];
			const value = selectedSearchValue(choices, highlighted);

			return { label: choice?.label ?? '', submitted: choice !== undefined && value !== undefined, value };
		},
	};
};
