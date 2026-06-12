import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { acceptAutocompleteMatch, autocompleteNavigationDirection, canAcceptAutocomplete, moveAutocompleteHighlight } from '#tui/prompts/suggest/autocomplete';
import { renderAutocomplete, renderCancelledAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import { characterLength } from '#tui/typed-value/characters';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type AutocompleteReadResult = {
	cancelled: boolean;
	rendered: boolean;
	value: string;
};

export const readAutocompleteValue = async (options: SuggestOptions): Promise<AutocompleteReadResult> => {
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
	let highlighted = 0;

	let matches = await resolveSuggestions(options.options, state.value);

	renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return {
				cancelled: false,
				rendered: true,
				value: state.value,
			};
		}

		const direction = autocompleteNavigationDirection(key);

		if (direction !== null) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = moveAutocompleteHighlight(matches, highlighted, direction);
			renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if (key === Key.tab && canAcceptAutocomplete(state)) {
			matches = await resolveSuggestions(options.options, state.value);

			const next = acceptAutocompleteMatch(state, matches[highlighted], true);

			if (next !== null) {
				state = next;

				matches = await resolveSuggestions(options.options, state.value);
			} else {
				highlighted = 0;
			}

			renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		if ((key === Key.right || key === Key.rightArrow) && canAcceptAutocomplete(state)) {
			matches = await resolveSuggestions(options.options, state.value);

			state = acceptAutocompleteMatch(state, matches[highlighted], false) ?? state;

			renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.submitted) {
			return {
				cancelled: false,
				rendered: true,
				value: state.value,
			};
		}

		if (next.cancelled) {
			renderCancelledAutocomplete(options.message, state.value, options.placeholder);

			return {
				cancelled: true,
				rendered: true,
				value: await cancelPrompt(state.value),
			};
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = 0;

		matches = await resolveSuggestions(options.options, state.value);

		renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder);
	}
};
