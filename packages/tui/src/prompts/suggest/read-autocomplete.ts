import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { acceptAutocompleteMatch, autocompleteNavigationDirection, canAcceptAutocomplete, moveAutocompleteHighlight } from '#tui/prompts/suggest/autocomplete';
import { initialSuggestionState, suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { renderAutocomplete, renderCancelledAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type AutocompleteReadResult = TextSuggestionReadResult;

export const readAutocompleteValue = async (options: SuggestOptions): Promise<AutocompleteReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return suggestionReadResult(await ask(options.message, options.hint), false);
	}

	let state = initialSuggestionState(options.default ?? '');
	let highlighted = 0;

	let matches = await resolveSuggestions(options.options, state.value);

	let frame = renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder, options.info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return suggestionReadResult(state.value, true, false, frame);
		}

		const direction = autocompleteNavigationDirection(key);

		if (direction !== null) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = moveAutocompleteHighlight(matches, highlighted, direction);
			eraseRenderedFrame(frame);
			frame = renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder, options.info);
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

			eraseRenderedFrame(frame);
			frame = renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder, options.info);
			continue;
		}

		if ((key === Key.right || key === Key.rightArrow) && canAcceptAutocomplete(state)) {
			matches = await resolveSuggestions(options.options, state.value);

			state = acceptAutocompleteMatch(state, matches[highlighted], false) ?? state;

			eraseRenderedFrame(frame);
			frame = renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder, options.info);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.submitted) {
			return suggestionReadResult(state.value, true, false, frame);
		}

		if (next.cancelled) {
			eraseRenderedFrame(frame);
			renderCancelledAutocomplete(options.message, state.value, options.placeholder);

			return suggestionReadResult(await cancelPrompt(state.value), true, true);
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = 0;

		matches = await resolveSuggestions(options.options, state.value);

		eraseRenderedFrame(frame);
		frame = renderAutocomplete(options.message, state, matches, highlighted, options.hint, options.placeholder, options.info);
	}
};
