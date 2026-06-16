import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { markedChoiceValues } from '#tui/prompts/select/multiple';
import { applyMultipleChoicesKey } from '#tui/prompts/select/read-multiple/keys';
import { cancelledMultipleChoicesResult, multipleChoicesResult } from '#tui/prompts/select/read-multiple/result';
import { createMultipleChoicesReaderSession } from '#tui/prompts/select/read-multiple/session';
import { renderCancelledChoices } from '#tui/prompts/select/render';
import type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export const readMultipleChoicesInteractive = async <T>(
	readKey: () => Promise<string | null>,
	message: string,
	choices: Array<Choice<T>>,
	defaults: T[] = [],
	scroll?: number,
	info?: MultiSelectPromptOptions<T>['info'],
): Promise<MultipleChoicesReadResult<T>> => {
	const session = createMultipleChoicesReaderSession(message, choices, defaults, scroll, info);

	session.render();

	while (true) {
		const key = await readKey();

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
