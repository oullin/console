import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { clearsSuggestionHighlight, moveSuggestionHighlight, suggestNavigationAction } from '#tui/prompts/suggest/keys';
import { renderCancelledSuggestion, renderSuggestions } from '#tui/prompts/suggest/render';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import { characterLength } from '#tui/typed-value/characters';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type SuggestReadResult = {
	cancelled: boolean;
	frame?: string;
	rendered: boolean;
	value: string;
};

export const readSuggestionValue = async (options: SuggestOptions): Promise<SuggestReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return {
			cancelled: false,
			rendered: false,
			value: await ask(options.message, options.hint),
		};
	}

	let state = {
		cursor: characterLength(options.default ?? ''),
		value: options.default ?? '',
	};
	let highlighted: number | null = null;

	let matches: string[] = await resolveSuggestions(options.options, state.value);

	let frame = renderSuggestions(options.message, state.value, state.cursor, matches, highlighted, options.scroll, options.info, options.placeholder);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return {
				cancelled: false,
				frame,
				rendered: true,
				value: state.value,
			};
		}

		const action = suggestNavigationAction(key);

		if (action !== null && (action !== 'first' || highlighted !== null) && (action !== 'last' || highlighted !== null)) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = moveSuggestionHighlight(matches, highlighted, action, options.scroll);
			eraseRenderedFrame(frame);
			frame = renderSuggestions(options.message, state.value, state.cursor, matches, highlighted, options.scroll, options.info, options.placeholder);
			continue;
		}

		if (clearsSuggestionHighlight(key) && highlighted !== null) {
			highlighted = null;
			eraseRenderedFrame(frame);
			frame = renderSuggestions(options.message, state.value, state.cursor, matches, highlighted, options.scroll, options.info, options.placeholder);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null && matches[highlighted] !== undefined) {
				return {
					cancelled: false,
					frame,
					rendered: true,
					value: matches[highlighted],
				};
			}

			return {
				cancelled: false,
				frame,
				rendered: true,
				value: state.value,
			};
		}

		const next = applyTypedKey(state, key);

		if (next.submitted) {
			return {
				cancelled: false,
				frame,
				rendered: true,
				value: state.value,
			};
		}

		if (next.cancelled) {
			eraseRenderedFrame(frame);
			renderCancelledSuggestion(options.message, state.value, options.placeholder);

			return {
				cancelled: true,
				rendered: true,
				value: await cancelPrompt(state.value),
			};
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = null;

		matches = await resolveSuggestions(options.options, state.value);

		eraseRenderedFrame(frame);
		frame = renderSuggestions(options.message, state.value, state.cursor, matches, highlighted, options.scroll, options.info, options.placeholder);
	}
};
