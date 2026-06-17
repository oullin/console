import { applyTypedKey } from '#tui/typed-value';
import { initialSuggestionState } from '#tui/prompts/suggest/read-result';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

export type SuggestQueryInputResult = {
	cancelled: boolean;
	changed: boolean;
	submitted: boolean;
};

export type SuggestQueryState = {
	applyTypedInput(key: string): Promise<SuggestQueryInputResult>;
	matches(): string[];
	resolve(): Promise<void>;
	set(next: TypedValueState): Promise<void>;
	value(): TypedValueState;
};

export const createSuggestQueryState = async (options: SuggestOptions): Promise<SuggestQueryState> => {
	let value = initialSuggestionState(options.default ?? '');

	let matches = await resolveSuggestions(options.options, value.value);

	const resolve = async (): Promise<void> => {
		matches = await resolveSuggestions(options.options, value.value);
	};

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(value, key);

			if (next.submitted || next.cancelled) {
				return { cancelled: next.cancelled, changed: false, submitted: next.submitted };
			}

			value = { cursor: next.cursor, value: next.value };

			await resolve();

			return { cancelled: false, changed: true, submitted: false };
		},
		matches() {
			return matches;
		},
		resolve,
		async set(next) {
			value = next;

			await resolve();
		},
		value() {
			return value;
		},
	};
};
