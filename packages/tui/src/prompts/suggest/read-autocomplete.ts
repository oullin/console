import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { autocompleteNavigationDirection, canAcceptAutocomplete } from '#tui/prompts/suggest/autocomplete';
import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { createAutocompleteReaderSession } from '#tui/prompts/suggest/read-autocomplete/session';
import { renderCancelledAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type AutocompleteReadResult = TextSuggestionReadResult;

export const readAutocompleteValue = async (options: SuggestOptions): Promise<AutocompleteReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return suggestionReadResult(await ask(options.message, options.hint), false);
	}

	const session = await createAutocompleteReaderSession(options);

	session.render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return suggestionReadResult(session.state().value, true, false, session.frame());
		}

		const direction = autocompleteNavigationDirection(key);

		if (direction !== null) {
			await session.move(direction);

			continue;
		}

		if (key === Key.tab && canAcceptAutocomplete(session.state())) {
			await session.acceptHighlighted(true);

			continue;
		}

		if ((key === Key.right || key === Key.rightArrow) && canAcceptAutocomplete(session.state())) {
			await session.acceptHighlighted(false);

			continue;
		}

		const next = await session.applyTypedInput(key);

		if (next.submitted) {
			return suggestionReadResult(session.state().value, true, false, session.frame());
		}

		if (next.cancelled) {
			eraseRenderedFrame(session.frame());
			renderCancelledAutocomplete(options.message, session.state().value, options.placeholder);

			return suggestionReadResult(await cancelPrompt(session.state().value), true, true);
		}
	}
};
