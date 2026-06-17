import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask } from '#tui/prompt';
import { clearsSuggestionHighlight, suggestNavigationAction } from '#tui/prompts/suggest/keys';
import { cancelSuggestionValue } from '#tui/prompts/suggest/read/cancel';
import { currentSuggestionValue, highlightedSuggestionValue } from '#tui/prompts/suggest/read/submission';
import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { createSuggestReaderSession } from '#tui/prompts/suggest/read/session';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type SuggestReadResult = TextSuggestionReadResult;

export const readSuggestionValue = async (options: SuggestOptions): Promise<SuggestReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return suggestionReadResult(await ask(options.message, options.hint), false);
	}

	const session = await createSuggestReaderSession(options);

	session.render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return highlightedSuggestionValue(session);
		}

		const action = suggestNavigationAction(key);

		if (action !== null && (action !== 'first' || session.highlighted() !== null) && (action !== 'last' || session.highlighted() !== null)) {
			await session.move(action);

			continue;
		}

		if (clearsSuggestionHighlight(key) && session.highlighted() !== null) {
			session.clearHighlight();
			continue;
		}

		if (key === Key.enter) {
			return highlightedSuggestionValue(session);
		}

		const next = await session.applyTypedInput(key);

		if (next.submitted) {
			return currentSuggestionValue(session);
		}

		if (next.cancelled) {
			return cancelSuggestionValue(options, session);
		}
	}
};
