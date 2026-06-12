import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt, PromptValidationError } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { findChoice, firstEnabledIndex } from '#tui/concerns/choices';
import { moveSelectHighlight, selectNavigationAction } from '#tui/prompts/select/keys';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { renderCancelledChoice, renderSelectedChoice } from '#tui/prompts/select/render';
import type { Choice, SelectPromptOptions } from '#tui/types';

export type SelectedChoiceReadResult<T> = {
	cancelled: boolean;
	submitted: boolean;
	submittedLabel: string;
	value: T;
};

const defaultChoiceIndex = <T>(choices: Array<Choice<T>>, defaultValue: T | undefined): number => {
	if (defaultValue === undefined) {
		return firstEnabledIndex(choices);
	}

	const index = choices.findIndex((choice) => !choice.disabled && Object.is(choice.value, defaultValue));

	return index === -1 ? firstEnabledIndex(choices) : index;
};

export const readSelectedChoice = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaultValue?: T,
	hint?: string,
	scroll?: number,
	info?: SelectPromptOptions<T>['info'],
): Promise<SelectedChoiceReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		if (answer.trim() === '' && defaultValue !== undefined) {
			const choice = choices.find((candidate) => !candidate.disabled && Object.is(candidate.value, defaultValue));

			if (choice) {
				return { cancelled: false, submitted: false, submittedLabel: choice.label, value: choice.value };
			}
		}

		const choice = findChoice(choices, answer);

		if (!choice || choice.disabled) {
			throw new PromptValidationError('Please select a valid option.');
		}

		return { cancelled: false, submitted: false, submittedLabel: choice.label, value: choice.value };
	}

	let selected = defaultChoiceIndex(choices, defaultValue);

	renderSelectedChoice(message, choices, selected, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			throw new PromptValidationError('Please select a valid option.');
		}

		if (key === Key.ctrlC) {
			renderCancelledChoice(message, choices, selected, scroll);

			const choice = choices[selected];

			if (!choice || choice.disabled) {
				throw new PromptValidationError('Please select a valid option.');
			}

			return { cancelled: true, submitted: false, submittedLabel: choice.label, value: await cancelPrompt(choice.value) };
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			const choice = choices[numeric - 1];

			return { cancelled: false, submitted: true, submittedLabel: choice.label, value: choice.value };
		}

		const action = selectNavigationAction(key, { lineControls: true });

		if (action !== null) {
			selected = moveSelectHighlight(choices, selected, action, scroll);
			renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			const choice = choices[selected];

			if (!choice || choice.disabled) {
				throw new PromptValidationError('Please select a valid option.');
			}

			return { cancelled: false, submitted: true, submittedLabel: choice.label, value: choice.value };
		}
	}
};
