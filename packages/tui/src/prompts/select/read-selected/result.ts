import { PromptValidationError } from '#tui/prompt';
import { choiceByValue, choiceValueEquals, firstEnabledIndex } from '#tui/concerns/choices';
import type { SelectedChoiceReadResult } from '#tui/prompts/select/read-selected/types';
import type { Choice } from '#tui/types';

export const invalidSelectedChoice = (): PromptValidationError => new PromptValidationError('Please select a valid option.');

export const defaultChoiceIndex = <T>(choices: Array<Choice<T>>, defaultValue: T | undefined, hasDefault = false): number => {
	if (!hasDefault) {
		return firstEnabledIndex(choices);
	}

	const index = choices.findIndex((choice) => !choice.disabled && choiceValueEquals(choice.value, defaultValue));

	return index === -1 ? firstEnabledIndex(choices) : index;
};

export const selectedChoiceByDefault = <T>(choices: Array<Choice<T>>, defaultValue: T | undefined, hasDefault = false): Choice<T> | undefined => {
	return hasDefault ? choiceByValue(choices, defaultValue) : undefined;
};

export const selectedChoiceAt = <T>(choices: Array<Choice<T>>, index: number): Choice<T> => {
	const choice = choices[index];

	if (!choice || choice.disabled) {
		throw invalidSelectedChoice();
	}

	return choice;
};

export const selectedChoiceResult = <T>(choice: Choice<T>, submitted: boolean, cancelled = false, frame?: string): SelectedChoiceReadResult<T> => ({
	cancelled,
	frame,
	submitted,
	submittedLabel: choice.label,
	value: choice.value,
});

export const cancelledSelectedChoiceResult = <T>(choice: Choice<T> | undefined, cancelledValue: T, frame?: string): SelectedChoiceReadResult<T> => ({
	cancelled: true,
	frame,
	submitted: false,
	submittedLabel: choice?.label ?? '',
	value: cancelledValue,
});
