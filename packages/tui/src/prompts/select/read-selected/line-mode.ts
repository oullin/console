import { ask } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { findChoice } from '#tui/concerns/choices';
import { invalidSelectedChoice, selectedChoiceByDefault, selectedChoiceResult } from '#tui/prompts/select/read-selected/result';
import type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';
import type { Choice } from '#tui/types';

export const readSelectedChoiceLineMode = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaultValue: T | undefined,
	hasDefault: boolean,
	hint?: string,
): Promise<SelectedChoiceReadResult<T>> => {
	const rendered = renderChoices(choices);

	const answer = await ask(`${message}\n${rendered}\n`, hint);

	if (answer.trim() === '' && hasDefault) {
		const choice = selectedChoiceByDefault(choices, defaultValue, hasDefault);

		if (choice) {
			return selectedChoiceResult(choice, false);
		}
	}

	const choice = findChoice(choices, answer);

	if (!choice || choice.disabled) {
		throw invalidSelectedChoice();
	}

	return selectedChoiceResult(choice, false);
};
