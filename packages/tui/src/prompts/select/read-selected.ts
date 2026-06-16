import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { selectNavigationAction } from '#tui/prompts/select/keys';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { readSelectedChoiceLineMode } from '#tui/prompts/select/read-selected/line-mode';
import { invalidSelectedChoice, selectedChoiceAt, selectedChoiceByDefault, selectedChoiceResult } from '#tui/prompts/select/read-selected/result';
import { createSelectedChoiceReaderSession } from '#tui/prompts/select/read-selected/session';
import type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';
import { renderCancelledChoice } from '#tui/prompts/select/render';
import type { Choice, SelectPromptOptions } from '#tui/types';

export type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';

export const readSelectedChoice = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaultValue?: T,
	hasDefault = false,
	hint?: string,
	scroll?: number,
	info?: SelectPromptOptions<T>['info'],
): Promise<SelectedChoiceReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return readSelectedChoiceLineMode(message, choices, defaultValue, hasDefault, hint);
	}

	const session = createSelectedChoiceReaderSession(message, choices, defaultValue, hasDefault, scroll, info);

	session.render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			const choice = selectedChoiceByDefault(choices, defaultValue, hasDefault);

			if (choice) {
				return selectedChoiceResult(choice, false);
			}

			throw invalidSelectedChoice();
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(session.frame());
			renderCancelledChoice(message, choices, session.selected(), scroll);

			const choice = selectedChoiceAt(choices, session.selected());

			return selectedChoiceResult({ ...choice, value: await cancelPrompt(choice.value) }, false, true);
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			const choice = selectedChoiceAt(choices, numeric - 1);

			return selectedChoiceResult(choice, true, false, session.frame());
		}

		const action = selectNavigationAction(key, { lineControls: true });

		if (action !== null) {
			session.move(action);
			continue;
		}

		if (key === Key.enter) {
			const choice = selectedChoiceAt(choices, session.selected());

			return selectedChoiceResult(choice, true, false, session.frame());
		}
	}
};
