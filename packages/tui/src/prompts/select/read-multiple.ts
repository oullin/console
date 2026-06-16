import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderChoices } from '#tui/theme';
import { selectNavigationAction } from '#tui/prompts/select/keys';
import { choicesFromCommaSeparated, markedChoiceValues } from '#tui/prompts/select/multiple';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { cancelledMultipleChoicesResult, multipleChoicesResult, multipleChoicesValueResult } from '#tui/prompts/select/read-multiple/result';
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
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		const value = answer.trim() === '' ? defaults : choicesFromCommaSeparated(choices, answer);

		return multipleChoicesValueResult(value);
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

		if (key.includes(',')) {
			return multipleChoicesValueResult(choicesFromCommaSeparated(choices, key));
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && session.toggleIndex(numeric - 1)) {
			continue;
		}

		const action = selectNavigationAction(key);

		if (action !== null) {
			session.move(action);
			continue;
		}

		if (key === Key.ctrlA) {
			session.toggleAll();
			continue;
		}

		if (key === Key.space) {
			session.toggleSelected();
			continue;
		}

		if (key === Key.enter) {
			return multipleChoicesResult(choices, session.marked(), true, false, session.frame());
		}
	}
};
