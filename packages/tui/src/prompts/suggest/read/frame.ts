import { eraseRenderedFrame } from '#tui/status/frame';
import { renderSuggestions } from '#tui/prompts/suggest/render';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

type SuggestFrameRenderOptions = {
	highlighted: number | null;
	matches: string[];
	state: TypedValueState;
};

type SuggestFrameRenderer = {
	current(): string;
	render(options: SuggestFrameRenderOptions): void;
};

export const createSuggestFrameRenderer = (options: SuggestOptions): SuggestFrameRenderer => {
	let frame = '';

	return {
		current() {
			return frame;
		},
		render({ highlighted, matches, state }) {
			if (frame.length > 0) {
				eraseRenderedFrame(frame);
			}

			frame = renderSuggestions(options.message, state.value, state.cursor, matches, highlighted, options.scroll, options.info, options.placeholder);
		},
	};
};
