import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { selectedChoiceAt, selectedChoiceResult } from '#tui/prompts/select/read-selected/result';
import { renderCancelledChoice } from '#tui/prompts/select/render';
import type { SelectedChoiceReaderSession } from '#tui/prompts/select/read-selected/session';
import type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';
import type { Choice } from '#tui/types';

export const cancelSelectedChoice = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	session: SelectedChoiceReaderSession,
	scroll?: number,
): Promise<SelectedChoiceReadResult<T>> => {
	eraseRenderedFrame(session.frame());
	renderCancelledChoice(message, choices, session.selected(), scroll);

	const choice = selectedChoiceAt(choices, session.selected());

	return selectedChoiceResult({ ...choice, value: await cancelPrompt(choice.value) }, false, true);
};
