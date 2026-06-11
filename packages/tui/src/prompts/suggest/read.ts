import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { clearsSuggestionHighlight, moveSuggestionHighlight, suggestNavigationAction } from '#tui/prompts/suggest/keys';
import { renderSuggestions } from '#tui/prompts/suggest/render';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import { characterLength } from '#tui/typed-value/characters';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const readSuggestionValue = async (options: SuggestOptions): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return ask(options.message, options.hint);
	}

	let state = {
		cursor: characterLength(options.default ?? ''),
		value: options.default ?? '',
	};
	let highlighted: number | null = null;

	let matches: string[] = await resolveSuggestions(options.options, state.value);

	renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		const action = suggestNavigationAction(key);

		if (action !== null && (action !== 'first' || highlighted !== null) && (action !== 'last' || highlighted !== null)) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = moveSuggestionHighlight(matches, highlighted, action, options.scroll);
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (clearsSuggestionHighlight(key) && highlighted !== null) {
			highlighted = null;
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null && matches[highlighted] !== undefined) {
				return matches[highlighted];
			}

			return state.value;
		}

		const next = applyTypedKey(state, key);

		if (next.submitted) {
			return state.value;
		}

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return cancelPrompt(state.value);
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = null;

		matches = await resolveSuggestions(options.options, state.value);

		renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
	}
};
