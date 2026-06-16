import { Key } from '#tui/key';
import { selectNavigationAction } from '#tui/prompts/select/keys';
import { choicesFromCommaSeparated } from '#tui/prompts/select/multiple';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { multipleChoicesValueResult } from '#tui/prompts/select/read-multiple/result';
import type { MultipleChoicesReaderSession } from '#tui/prompts/select/read-multiple/session';
import type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';
import type { Choice } from '#tui/types';

export type MultipleChoicesKeyResult<T> =
	| {
			handled: false;
	  }
	| {
			handled: true;
			result?: MultipleChoicesReadResult<T>;
	  };

export const applyMultipleChoicesKey = <T>(key: string, choices: Array<Choice<T>>, session: MultipleChoicesReaderSession): MultipleChoicesKeyResult<T> => {
	if (key.includes(',')) {
		return { handled: true, result: multipleChoicesValueResult(choicesFromCommaSeparated(choices, key)) };
	}

	const numeric = parseChoiceIndex(key);

	if (!Number.isNaN(numeric) && session.toggleIndex(numeric - 1)) {
		return { handled: true };
	}

	const action = selectNavigationAction(key);

	if (action !== null) {
		session.move(action);

		return { handled: true };
	}

	if (key === Key.ctrlA) {
		session.toggleAll();

		return { handled: true };
	}

	if (key === Key.space) {
		session.toggleSelected();

		return { handled: true };
	}

	return { handled: false };
};
