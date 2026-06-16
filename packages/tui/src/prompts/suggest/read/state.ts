import { applyTypedKey } from '#tui/typed-value';
import { moveSuggestionHighlight } from '#tui/prompts/suggest/keys';
import { initialSuggestionState } from '#tui/prompts/suggest/read-result';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { SuggestNavigationAction } from '#tui/prompts/suggest/keys';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

export type SuggestReaderState = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean; submitted: boolean }>;
	clearHighlight(): void;
	highlighted(): number | null;
	matches(): string[];
	move(action: SuggestNavigationAction): Promise<void>;
	value(): TypedValueState;
};

export const createSuggestReaderState = async (options: SuggestOptions): Promise<SuggestReaderState> => {
	let value = initialSuggestionState(options.default ?? '');
	let highlighted: number | null = null;

	let matches = await resolveSuggestions(options.options, value.value);

	const resolveMatches = async (): Promise<void> => {
		matches = await resolveSuggestions(options.options, value.value);
	};

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(value, key);

			if (next.submitted || next.cancelled) {
				return { cancelled: next.cancelled, submitted: next.submitted };
			}

			value = { cursor: next.cursor, value: next.value };
			highlighted = null;

			await resolveMatches();

			return { cancelled: false, submitted: false };
		},
		clearHighlight() {
			highlighted = null;
		},
		highlighted() {
			return highlighted;
		},
		matches() {
			return matches;
		},
		async move(action) {
			await resolveMatches();

			highlighted = moveSuggestionHighlight(matches, highlighted, action, options.scroll);
		},
		value() {
			return value;
		},
	};
};
