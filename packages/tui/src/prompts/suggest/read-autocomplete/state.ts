import { applyTypedKey } from '#tui/typed-value';
import { acceptAutocompleteMatch, moveAutocompleteHighlight } from '#tui/prompts/suggest/autocomplete';
import { initialSuggestionState } from '#tui/prompts/suggest/read-result';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

export type AutocompleteReaderState = {
	acceptHighlighted(requireGrowth: boolean): Promise<void>;
	applyTypedInput(key: string): Promise<{ cancelled: boolean; submitted: boolean }>;
	highlighted(): number;
	matches(): string[];
	move(direction: 1 | -1): Promise<void>;
	value(): TypedValueState;
};

export const createAutocompleteReaderState = async (options: SuggestOptions): Promise<AutocompleteReaderState> => {
	let value = initialSuggestionState(options.default ?? '');
	let highlighted = 0;

	let matches = await resolveSuggestions(options.options, value.value);

	const resolveMatches = async (): Promise<void> => {
		matches = await resolveSuggestions(options.options, value.value);
	};

	return {
		async acceptHighlighted(requireGrowth) {
			await resolveMatches();

			const next = acceptAutocompleteMatch(value, matches[highlighted], requireGrowth);

			if (next !== null) {
				value = next;

				await resolveMatches();
			} else {
				highlighted = 0;
			}
		},
		async applyTypedInput(key) {
			const next = applyTypedKey(value, key);

			if (next.submitted || next.cancelled) {
				return { cancelled: next.cancelled, submitted: next.submitted };
			}

			value = { cursor: next.cursor, value: next.value };
			highlighted = 0;

			await resolveMatches();

			return { cancelled: false, submitted: false };
		},
		highlighted() {
			return highlighted;
		},
		matches() {
			return matches;
		},
		async move(direction) {
			await resolveMatches();

			highlighted = moveAutocompleteHighlight(matches, highlighted, direction);
		},
		value() {
			return value;
		},
	};
};
