import { eraseRenderedFrame } from '#tui/status/frame';
import { renderSearchChoices } from '#tui/prompts/search/render';
import type { SingleSearchReaderState } from '#tui/prompts/search/read-single/state';
import type { SearchReadOptions } from '#tui/prompts/search/read-single/types';

export type SearchReaderSessionFrame = {
	render(): void;
	value(): string;
};

export const createSearchReaderSessionFrame = <T>(options: SearchReadOptions<T>, state: SingleSearchReaderState<T>): SearchReaderSessionFrame => {
	let frame = '';

	return {
		render() {
			if (frame.length > 0) {
				eraseRenderedFrame(frame);
			}

			const query = state.query();

			frame = renderSearchChoices(options.message, query.value, query.cursor, state.choices(), state.highlighted(), new Set(), [], options.scroll, options.info, false, options.placeholder);
		},
		value() {
			return frame;
		},
	};
};
