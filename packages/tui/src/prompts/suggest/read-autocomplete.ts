import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask } from '#tui/prompt';
import { autocompleteNavigationDirection, canAcceptAutocomplete } from '#tui/prompts/suggest/autocomplete';
import { cancelAutocompleteValue } from '#tui/prompts/suggest/read-autocomplete/cancel';
import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { createAutocompleteReaderSession } from '#tui/prompts/suggest/read-autocomplete/session';
import { currentAutocompleteValue } from '#tui/prompts/suggest/read-autocomplete/submission';
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
			return currentAutocompleteValue(session);
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
			return currentAutocompleteValue(session);
		}

		if (next.cancelled) {
			return cancelAutocompleteValue(options, session);
		}
	}
};
