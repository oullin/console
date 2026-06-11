import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, PromptValidationError } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { findChoice, firstEnabledIndex, nextEnabledIndex } from '#tui/concerns/choices';
import { lastEnabledChoiceIndex, nextChoiceKeys, parseChoiceIndex, previousChoiceKeys } from '#tui/prompts/select/navigation';
import { renderSelectedChoice } from '#tui/prompts/select/render';
import type { Choice, SelectPromptOptions } from '#tui/types';

export const readSelectedChoice = async <T>(message: string, choices: Array<Choice<T>>, hint?: string, scroll?: number, info?: SelectPromptOptions<T>['info']): Promise<T> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		const choice = findChoice(choices, answer);

		if (!choice || choice.disabled) {
			throw new PromptValidationError('Please select a valid option.');
		}

		return choice.value;
	}

	let selected = firstEnabledIndex(choices);

	renderSelectedChoice(message, choices, selected, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			throw new PromptValidationError('Please select a valid option.');
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			return choices[numeric - 1].value;
		}

		if (nextChoiceKeys(key)) {
			selected = nextEnabledIndex(choices, selected, 1);
			renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (previousChoiceKeys(key)) {
			selected = nextEnabledIndex(choices, selected, -1);
			renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (oneOf([Key.home, Key.ctrlA], key)) {
			selected = firstEnabledIndex(choices);
			renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (oneOf([Key.end, Key.ctrlE], key)) {
			selected = lastEnabledChoiceIndex(choices);
			renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			const choice = choices[selected];

			if (!choice || choice.disabled) {
				throw new PromptValidationError('Please select a valid option.');
			}

			return choice.value;
		}
	}
};
