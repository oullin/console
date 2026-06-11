import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, PromptValidationError } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { findChoice, firstEnabledIndex, nextEnabledIndex } from '#tui/concerns/choices';
import { lastEnabledChoiceIndex, nextChoiceKeys, pageEnabledChoiceIndex, parseChoiceIndex, previousChoiceKeys } from '#tui/prompts/select/navigation';
import { renderSelectedChoice } from '#tui/prompts/select/render';
import type { Choice, SelectPromptOptions } from '#tui/types';

const defaultChoiceIndex = <T>(choices: Array<Choice<T>>, defaultValue: T | undefined): number => {
	if (defaultValue === undefined) {
		return firstEnabledIndex(choices);
	}

	const index = choices.findIndex((choice) => !choice.disabled && Object.is(choice.value, defaultValue));

	return index === -1 ? firstEnabledIndex(choices) : index;
};

export const readSelectedChoice = async <T>(message: string, choices: Array<Choice<T>>, defaultValue?: T, hint?: string, scroll?: number, info?: SelectPromptOptions<T>['info']): Promise<T> => {
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

	let selected = defaultChoiceIndex(choices, defaultValue);

	renderSelectedChoice(message, choices, selected, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			throw new PromptValidationError('Please select a valid option.');
		}

		if (key === Key.ctrlC) {
			environment.error.write('Cancelled.\n');

			const choice = choices[selected];

			if (!choice || choice.disabled) {
				throw new PromptValidationError('Please select a valid option.');
			}

			return choice.value;
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

		if (key === Key.pageDown) {
			selected = pageEnabledChoiceIndex(choices, selected, 1, scroll);
			renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (key === Key.pageUp) {
			selected = pageEnabledChoiceIndex(choices, selected, -1, scroll);
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
