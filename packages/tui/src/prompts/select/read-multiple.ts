import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { markedChoiceValues } from '#tui/prompts/select/multiple';
import { applyMultipleChoicesKey } from '#tui/prompts/select/read-multiple/keys';
import { readLineMultipleChoices } from '#tui/prompts/select/read-multiple/line-mode';
import { cancelledMultipleChoicesResult, multipleChoicesResult } from '#tui/prompts/select/read-multiple/result';
import { createMultipleChoicesReaderSession } from '#tui/prompts/select/read-multiple/session';
import type { MultipleChoicesReadResult as MultipleChoicesReadResultType } from '#tui/prompts/select/read-multiple/types';
import { renderCancelledChoices } from '#tui/prompts/select/render';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';

export const readMultipleChoices = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaults: T[] = [],
	hint?: string,
	scroll?: number,
	info?: MultiSelectPromptOptions<T>['info'],
): Promise<MultipleChoicesReadResultType<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return readLineMultipleChoices(message, choices, defaults, hint);
	}

	const session = createMultipleChoicesReaderSession(message, choices, defaults, scroll, info);

	session.render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return multipleChoicesResult(choices, session.marked(), true, false, session.frame());
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(session.frame());
			renderCancelledChoices(message, choices, session.selected(), session.marked(), scroll);

			return cancelledMultipleChoicesResult(choices, session.marked(), await cancelPrompt(markedChoiceValues(choices, session.marked())));
		}

		const applied = applyMultipleChoicesKey(key, choices, session);

		if (applied.handled) {
			if (applied.result) {
				return applied.result;
			}

			continue;
		}

		if (key === Key.enter) {
			return multipleChoicesResult(choices, session.marked(), true, false, session.frame());
		}
	}
};
