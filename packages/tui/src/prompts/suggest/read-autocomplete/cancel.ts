import { cancelPrompt } from '#tui/prompt';
import { renderCancelledAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import { eraseRenderedFrame } from '#tui/status/frame';
import type { AutocompleteReaderSession } from '#tui/prompts/suggest/read-autocomplete/session';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';

export const cancelAutocompleteValue = async (
	options: SuggestOptions,
	session: AutocompleteReaderSession,
): Promise<TextSuggestionReadResult> => {
	const value = session.state().value;

	eraseRenderedFrame(session.frame());
	renderCancelledAutocomplete(options.message, value, options.placeholder);

	return suggestionReadResult(await cancelPrompt(value), true, true);
};
