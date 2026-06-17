import { cancelPrompt } from '#tui/prompt';
import { renderCancelledSuggestion } from '#tui/prompts/suggest/render';
import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { eraseRenderedFrame } from '#tui/status/frame';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';
import type { SuggestReaderSession } from '#tui/prompts/suggest/read/session';

export const cancelSuggestionValue = async (options: SuggestOptions, session: SuggestReaderSession): Promise<TextSuggestionReadResult> => {
	const value = session.state().value;

	eraseRenderedFrame(session.frame());
	renderCancelledSuggestion(options.message, value, options.placeholder);

	return suggestionReadResult(await cancelPrompt(value), true, true);
};
