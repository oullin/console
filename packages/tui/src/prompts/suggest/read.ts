import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { clearsSuggestionHighlight, suggestNavigationAction } from '#tui/prompts/suggest/keys';
import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { createSuggestReaderSession } from '#tui/prompts/suggest/read/session';
import { renderCancelledSuggestion } from '#tui/prompts/suggest/render';
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
			return suggestionReadResult(session.state().value, true, false, session.frame());
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
			const highlighted = session.highlighted();
			const match = highlighted === null ? undefined : session.matches()[highlighted];

			if (match !== undefined) {
				return suggestionReadResult(match, true, false, session.frame());
			}

			return suggestionReadResult(session.state().value, true, false, session.frame());
		}

		const next = await session.applyTypedInput(key);

		if (next.submitted) {
			return suggestionReadResult(session.state().value, true, false, session.frame());
		}

		if (next.cancelled) {
			eraseRenderedFrame(session.frame());
			renderCancelledSuggestion(options.message, session.state().value, options.placeholder);

			return suggestionReadResult(await cancelPrompt(session.state().value), true, true);
		}
	}
};
