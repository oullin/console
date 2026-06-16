import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderCancelledSearch } from '#tui/prompts/search/render';
import { cancelledSearchValue } from '#tui/prompts/search/read-single/result';
import type { SearchReaderSession } from '#tui/prompts/search/read-single/session';
import type { SearchChoiceReadResult } from '#tui/prompts/search/read-single/result';
import type { SearchReadOptions } from '#tui/prompts/search/read-single/types';

export const cancelInteractiveSearchChoice = async <T>(session: SearchReaderSession<T>, options: SearchReadOptions<T>): Promise<SearchChoiceReadResult<T>> => {
	eraseRenderedFrame(session.frame());
	renderCancelledSearch(options.message, session.query().value, options.placeholder);

	return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(cancelledSearchValue(session.choices(), session.highlighted(), options.default)) };
};

export const cancelInteractiveSearchInput = async <T>(session: SearchReaderSession<T>, options: SearchReadOptions<T>): Promise<SearchChoiceReadResult<T>> => {
	eraseRenderedFrame(session.frame());
	renderCancelledSearch(options.message, session.query().value, options.placeholder);

	return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(options.default) };
};
