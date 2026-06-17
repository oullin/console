import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderCancelledSearch } from '#tui/prompts/search/render';
import { selectedSearchValues } from '#tui/prompts/search/read-multi/result';
import type { MultiSearchChoicesReadResult } from '#tui/prompts/search/read-multi/result';
import type { MultiSearchReaderSession } from '#tui/prompts/search/read-multi/session';
import type { MultiSearchPromptOptions } from '#tui/types';

export const cancelMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>, session: MultiSearchReaderSession<T>): Promise<MultiSearchChoicesReadResult<T>> => {
	eraseRenderedFrame(session.frame());
	renderCancelledSearch(options.message, session.query().value, options.placeholder);

	const value = selectedSearchValues(session.selected());

	return {
		cancelled: true,
		submitted: false,
		submittedLabels: session.selectedLabels(),
		value: await cancelPrompt(value),
	};
};
