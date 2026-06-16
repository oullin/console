import type { SearchReaderSession } from '#tui/prompts/search/read-single/session';
import type { SearchChoiceReadResult } from '#tui/prompts/search/read-single/result';
import type { SearchReadOptions } from '#tui/prompts/search/read-single/types';

export const exhaustedInteractiveSearchChoice = <T>(options: SearchReadOptions<T>): SearchChoiceReadResult<T> => {
	return { cancelled: false, submitted: false, submittedLabel: '', value: options.default };
};

export const highlightedInteractiveSearchChoice = <T>(session: SearchReaderSession<T>): SearchChoiceReadResult<T> => {
	const selected = session.selectedSelection();

	return { cancelled: false, frame: session.frame(), submitted: selected.submitted, submittedLabel: selected.label, value: selected.value };
};

export const defaultInteractiveSearchChoice = async <T>(session: SearchReaderSession<T>): Promise<SearchChoiceReadResult<T>> => {
	const selected = await session.defaultSelection();

	return { cancelled: false, frame: session.frame(), submitted: selected.submitted, submittedLabel: selected.label, value: selected.value };
};
