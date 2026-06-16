import { eraseRenderedFrame } from '#tui/status/frame';
import { renderAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

type AutocompleteFrameRenderOptions = {
	highlighted: number;
	matches: string[];
	state: TypedValueState;
};

type AutocompleteFrameRenderer = {
	current(): string;
	render(options: AutocompleteFrameRenderOptions): void;
};

export const createAutocompleteFrameRenderer = (options: SuggestOptions): AutocompleteFrameRenderer => {
	let frame = '';

	return {
		current() {
			return frame;
		},
		render({ highlighted, matches, state }) {
			if (frame.length > 0) {
				eraseRenderedFrame(frame);
			}

			frame = renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder, options.info);
		},
	};
};
