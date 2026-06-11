import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { renderSuggestions } from '#tui/prompts/suggest/render';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const readAutocompleteValue = async (options: SuggestOptions): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return ask(options.message, options.hint);
	}

	let state = {
		cursor: options.default?.length ?? 0,
		value: options.default ?? '',
	};
	let highlighted = 0;

	let matches = await resolveSuggestions(options.options, state.value);

	renderSuggestions(options.message, state.value, matches, matches.length > 0 ? highlighted : null, options.scroll, options.info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		if (key === Key.up || key === Key.upArrow) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? 0 : (highlighted - 1 + matches.length) % matches.length;
			renderSuggestions(options.message, state.value, matches, matches.length > 0 ? highlighted : null, options.scroll, options.info);
			continue;
		}

		if (key === Key.down || key === Key.downArrow) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? 0 : (highlighted + 1) % matches.length;
			renderSuggestions(options.message, state.value, matches, matches.length > 0 ? highlighted : null, options.scroll, options.info);
			continue;
		}

		if ((key === Key.tab || key === Key.right || key === Key.rightArrow) && state.cursor >= [...state.value].length) {
			matches = await resolveSuggestions(options.options, state.value);

			const match = matches[highlighted];

			if (match !== undefined && match.length > state.value.length) {
				state = { cursor: match.length, value: match };

				matches = await resolveSuggestions(options.options, state.value);
			} else {
				highlighted = 0;
			}

			renderSuggestions(options.message, state.value, matches, matches.length > 0 ? highlighted : null, options.scroll, options.info);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.submitted) {
			return state.value;
		}

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return state.value;
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = 0;

		matches = await resolveSuggestions(options.options, state.value);

		renderSuggestions(options.message, state.value, matches, matches.length > 0 ? highlighted : null, options.scroll, options.info);
	}
};
