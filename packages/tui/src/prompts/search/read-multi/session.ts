import { eraseRenderedFrame } from '#tui/status/frame';
import { renderSearchChoices } from '#tui/prompts/search/render';
import { createMultiSearchReaderState } from '#tui/prompts/search/read-multi/state';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { TypedValueState } from '#tui/typed-value/types';
import type { MultiSearchPromptOptions } from '#tui/types';

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
	const state = await createMultiSearchReaderState(options);

	let frame = '';

	function render(): void {
		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		const query = state.query();

		frame = renderSearchChoices(
			options.message,
			query.value,
			query.cursor,
			state.displayedChoices(),
			state.highlighted(),
			state.markedChoiceIndexes(),
			state.selectedLabels(),
			options.scroll,
			options.info,
			true,
			options.placeholder,
		);
	}

	return {
		async applyTypedInput(key: string) {
			const next = await state.applyTypedInput(key);

			if (!next.cancelled) {
				render();
			}

			return next;
		},
		frame() {
			return frame;
		},
		highlighted() {
			return state.highlighted();
		},
		async move(action) {
			await state.move(action);

			render();
		},
		query() {
			return state.query();
		},
		render,
		selected() {
			return state.selected();
		},
		selectedLabels() {
			return state.selectedLabels();
		},
		toggleAllDisplayed() {
			state.toggleAllDisplayed();
			render();
		},
		toggleHighlighted() {
			state.toggleHighlighted();
			render();
		},
	};
};
