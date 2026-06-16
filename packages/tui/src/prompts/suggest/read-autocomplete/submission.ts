import { suggestionReadResult } from '#tui/prompts/suggest/read-result';
import type { AutocompleteReaderSession } from '#tui/prompts/suggest/read-autocomplete/session';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';

export const currentAutocompleteValue = (session: AutocompleteReaderSession): TextSuggestionReadResult => {
	return suggestionReadResult(session.state().value, true, false, session.frame());
};
