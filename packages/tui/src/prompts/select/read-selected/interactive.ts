import { Key } from '#tui/key';
import { selectNavigationAction } from '#tui/prompts/select/keys';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { cancelSelectedChoice } from '#tui/prompts/select/read-selected/interactive/cancel';
import { exhaustedSelectedChoice, indexedSelectedChoice, submittedSelectedChoice } from '#tui/prompts/select/read-selected/interactive/result';
import { createSelectedChoiceReaderSession } from '#tui/prompts/select/read-selected/session';
import type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';
import type { Choice, PromptInput, SelectPromptOptions } from '#tui/types';

export const readSelectedChoiceInteractive = async <T>(
	readKey: NonNullable<PromptInput['readKey']>,
	message: string,
	choices: Array<Choice<T>>,
	defaultValue?: T,
	hasDefault = false,
	scroll?: number,
	info?: SelectPromptOptions<T>['info'],
): Promise<SelectedChoiceReadResult<T>> => {
	const session = createSelectedChoiceReaderSession(message, choices, defaultValue, hasDefault, scroll, info);

	session.render();

	while (true) {
		const key = await readKey();

		if (key === null) {
			return exhaustedSelectedChoice(choices, defaultValue, hasDefault);
		}

		if (key === Key.ctrlC) {
			return cancelSelectedChoice(message, choices, session, scroll);
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			return indexedSelectedChoice(choices, numeric - 1, session.frame());
		}

		const action = selectNavigationAction(key, { lineControls: true });

		if (action !== null) {
			session.move(action);
			continue;
		}

		if (key === Key.enter) {
			return submittedSelectedChoice(choices, session);
		}
	}
};
