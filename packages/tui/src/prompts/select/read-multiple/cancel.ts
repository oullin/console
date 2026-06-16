import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { markedChoiceValues } from '#tui/prompts/select/multiple';
import { cancelledMultipleChoicesResult } from '#tui/prompts/select/read-multiple/result';
import type { MultipleChoicesReaderSession } from '#tui/prompts/select/read-multiple/session';
import type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';
import { renderCancelledChoices } from '#tui/prompts/select/render';
import type { Choice } from '#tui/types';

export const cancelMultipleChoices = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	session: MultipleChoicesReaderSession,
	scroll?: number,
): Promise<MultipleChoicesReadResult<T>> => {
	eraseRenderedFrame(session.frame());
	renderCancelledChoices(message, choices, session.selected(), session.marked(), scroll);

	const value = markedChoiceValues(choices, session.marked());

	return cancelledMultipleChoicesResult(choices, session.marked(), await cancelPrompt(value));
};
