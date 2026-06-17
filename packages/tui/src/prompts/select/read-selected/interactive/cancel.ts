import { cancelPrompt } from '#tui/prompt';
import { parseChoiceValue } from '#tui/concerns/validators/choice';
import { eraseRenderedFrame } from '#tui/status/frame';
import { cancelledSelectedChoiceResult } from '#tui/prompts/select/read-selected/result';
import { renderCancelledChoice } from '#tui/prompts/select/render';
import type { SelectedChoiceReaderSession } from '#tui/prompts/select/read-selected/session';
import type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';
import type { Choice } from '#tui/types';

export const cancelSelectedChoice = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	session: SelectedChoiceReaderSession,
	defaultValue?: T,
	scroll?: number,
): Promise<SelectedChoiceReadResult<T>> => {
	eraseRenderedFrame(session.frame());
	renderCancelledChoice(message, choices, session.selected(), scroll);

	const choice = choices[session.selected()];
	const fallback = choice?.value ?? defaultValue;

	const value = parseChoiceValue<T>(await cancelPrompt(fallback));

	return cancelledSelectedChoiceResult(choice, value);
};
