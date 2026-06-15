import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt, PromptValidationError } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderChoices } from '#tui/theme';
import { choiceByValue, choiceValueEquals, findChoice, firstEnabledIndex } from '#tui/concerns/choices';
import { moveSelectHighlight, selectNavigationAction } from '#tui/prompts/select/keys';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { renderCancelledChoice, renderSelectedChoice } from '#tui/prompts/select/render';
import type { Choice, SelectPromptOptions } from '#tui/types';

export type SelectedChoiceReadResult<T> = {
	cancelled: boolean;
	frame?: string;
	submitted: boolean;
	submittedLabel: string;
	value: T;
};

const defaultChoiceIndex = <T>(choices: Array<Choice<T>>, defaultValue: T | undefined, hasDefault = false): number => {
	if (!hasDefault) {
		return firstEnabledIndex(choices);
	}

	const index = choices.findIndex((choice) => !choice.disabled && choiceValueEquals(choice.value, defaultValue));

	return index === -1 ? firstEnabledIndex(choices) : index;
};

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
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		if (answer.trim() === '' && hasDefault) {
			const choice = choiceByValue(choices, defaultValue);

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

	let selected = defaultChoiceIndex(choices, defaultValue, hasDefault);

	let frame = renderSelectedChoice(message, choices, selected, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			if (hasDefault) {
				const choice = choiceByValue(choices, defaultValue);

				if (choice) {
					return { cancelled: false, submitted: false, submittedLabel: choice.label, value: choice.value };
				}
			}

			throw new PromptValidationError('Please select a valid option.');
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(frame);
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

			return { cancelled: false, frame, submitted: true, submittedLabel: choice.label, value: choice.value };
		}

		const action = selectNavigationAction(key, { lineControls: true });

		if (action !== null) {
			selected = moveSelectHighlight(choices, selected, action, scroll);
			eraseRenderedFrame(frame);
			frame = renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			const choice = choices[selected];

			if (!choice || choice.disabled) {
				throw new PromptValidationError('Please select a valid option.');
			}

			return { cancelled: false, frame, submitted: true, submittedLabel: choice.label, value: choice.value };
		}
	}
};
