import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { moveSuggestionHighlight } from '#tui/prompts/suggest/keys';
import { initialSuggestionState } from '#tui/prompts/suggest/read-result';
import { renderSuggestions } from '#tui/prompts/suggest/render';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { SuggestNavigationAction } from '#tui/prompts/suggest/keys';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

export type SuggestReaderSession = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean; submitted: boolean }>;
	clearHighlight(): void;
	frame(): string;
	highlighted(): number | null;
	matches(): string[];
	move(action: SuggestNavigationAction): Promise<void>;
	render(): void;
	state(): TypedValueState;
};

export const createSuggestReaderSession = async (options: SuggestOptions): Promise<SuggestReaderSession> => {
	let state = initialSuggestionState(options.default ?? '');
	let highlighted: number | null = null;

	let matches = await resolveSuggestions(options.options, state.value);

	let frame = '';

	const resolveMatches = async (): Promise<void> => {
		matches = await resolveSuggestions(options.options, state.value);
	};

	function render(): void {
		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		frame = renderSuggestions(options.message, state.value, state.cursor, matches, highlighted, options.scroll, options.info, options.placeholder);
	}

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(state, key);

			if (next.submitted || next.cancelled) {
				return { cancelled: next.cancelled, submitted: next.submitted };
			}

			state = { cursor: next.cursor, value: next.value };
			highlighted = null;

			await resolveMatches();

			render();

			return { cancelled: false, submitted: false };
		},
		clearHighlight() {
			highlighted = null;
			render();
		},
		frame() {
			return frame;
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
			render();
		},
		render,
		state() {
			return state;
		},
	};
};
