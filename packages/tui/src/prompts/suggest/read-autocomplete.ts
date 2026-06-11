import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { renderAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import { pageIndex } from '#tui/prompts/select/navigation';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

const characterLength = (value: string): number => [...value].length;

export const readAutocompleteValue = async (options: SuggestOptions): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return ask(options.message, options.hint);
	}

	let state = {
		cursor: characterLength(options.default ?? ''),
		value: options.default ?? '',
	};
	let highlighted = 0;

	let matches = await resolveSuggestions(options.options, state.value);

	renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? 0 : (highlighted - 1 + matches.length) % matches.length;
			renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if (key === Key.down || key === Key.downArrow || key === Key.ctrlN) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? 0 : (highlighted + 1) % matches.length;
			renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if (key === Key.pageDown) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = pageIndex(matches.length, highlighted, 1, options.scroll);
			renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if (key === Key.pageUp) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = pageIndex(matches.length, highlighted, -1, options.scroll);
			renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if (key === Key.tab && state.cursor >= characterLength(state.value)) {
			matches = await resolveSuggestions(options.options, state.value);

			const match = matches[highlighted];

			if (match !== undefined && match.length > state.value.length) {
				state = { cursor: match.length, value: match };

				matches = await resolveSuggestions(options.options, state.value);
			} else {
				highlighted = 0;
			}

			renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if ((key === Key.right || key === Key.rightArrow) && state.cursor >= characterLength(state.value)) {
			matches = await resolveSuggestions(options.options, state.value);

			const match = matches[highlighted];

			if (match !== undefined) {
				state = { cursor: match.length, value: match };
			}

			renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
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

		renderAutocomplete(options.message, state.value, matches, highlighted, options.hint, options.placeholder);
	}
};
