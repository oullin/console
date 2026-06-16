import { createMultiSearchFrameRenderer } from '#tui/prompts/search/read-multi/frame';
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

	const frame = createMultiSearchFrameRenderer(options, state);

	return {
		async applyTypedInput(key: string) {
			const next = await state.applyTypedInput(key);

			if (!next.cancelled) {
				frame.render();
			}

			return next;
		},
		frame() {
			return frame.current();
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
		render: frame.render,
		selected() {
			return state.selected();
		},
		selectedLabels() {
			return state.selectedLabels();
		},
		toggleAllDisplayed() {
			state.toggleAllDisplayed();
			frame.render();
		},
		toggleHighlighted() {
			state.toggleHighlighted();
			frame.render();
		},
	};
};
