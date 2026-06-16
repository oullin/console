import { createSearchReaderSessionFrame } from '#tui/prompts/search/read-single/session/frame';
import { createSingleSearchReaderState } from '#tui/prompts/search/read-single/state';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchReaderSelection, SearchReadOptions } from '#tui/prompts/search/read-single/types';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice } from '#tui/types';

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
	const state = await createSingleSearchReaderState(options, attempt);

	const frame = createSearchReaderSessionFrame(options, state);

	return {
		async applyTypedInput(key: string) {
			const next = await state.applyTypedInput(key);

			if (!next.cancelled) {
				frame.render();
			}

			return next;
		},
		choices() {
			return state.choices();
		},
		clearHighlight() {
			state.clearHighlight();
			frame.render();
		},
		async defaultSelection() {
			return state.defaultSelection();
		},
		frame() {
			return frame.value();
		},
		highlighted() {
			return state.highlighted();
		},
		async move(action) {
			await state.move(action);

			frame.render();
		},
		query() {
			return state.query();
		},
		render() {
			frame.render();
		},
		selectedSelection() {
			return state.selectedSelection();
		},
	};
};
