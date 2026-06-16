import { applyTypedKey } from '#tui/typed-value';
import { acceptAutocompleteMatch, moveAutocompleteHighlight } from '#tui/prompts/suggest/autocomplete';
import { createAutocompleteFrameRenderer } from '#tui/prompts/suggest/read-autocomplete/frame';
import { initialSuggestionState } from '#tui/prompts/suggest/read-result';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { TypedValueState } from '#tui/typed-value/types';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type AutocompleteReaderSession = {
	acceptHighlighted(requireGrowth: boolean): Promise<void>;
	applyTypedInput(key: string): Promise<{ cancelled: boolean; submitted: boolean }>;
	frame(): string;
	move(direction: 1 | -1): Promise<void>;
	render(): void;
	state(): TypedValueState;
};

export const createAutocompleteReaderSession = async (options: SuggestOptions): Promise<AutocompleteReaderSession> => {
	let state = initialSuggestionState(options.default ?? '');
	let highlighted = 0;

	let matches = await resolveSuggestions(options.options, state.value);

	const frame = createAutocompleteFrameRenderer(options);

	const resolveMatches = async (): Promise<void> => {
		matches = await resolveSuggestions(options.options, state.value);
	};

	function render(): void {
		frame.render({ highlighted, matches, state });
	}

	return {
		async acceptHighlighted(requireGrowth) {
			await resolveMatches();

			const next = acceptAutocompleteMatch(state, matches[highlighted], requireGrowth);

			if (next !== null) {
				state = next;

				await resolveMatches();
			} else {
				highlighted = 0;
			}

			render();
		},
		async applyTypedInput(key) {
			const next = applyTypedKey(state, key);

			if (next.submitted || next.cancelled) {
				return { cancelled: next.cancelled, submitted: next.submitted };
			}

			state = { cursor: next.cursor, value: next.value };
			highlighted = 0;

			await resolveMatches();

			render();

			return { cancelled: false, submitted: false };
		},
		frame() {
			return frame.current();
		},
		async move(direction) {
			await resolveMatches();

			highlighted = moveAutocompleteHighlight(matches, highlighted, direction);
			render();
		},
		render,
		state() {
			return state;
		},
	};
};
