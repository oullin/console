import { ask } from '#tui/prompt';
import { resolveLineSearchChoice } from '#tui/prompts/search/line-mode';
import type { Choice, SearchPromptOptions } from '#tui/types';

export type SearchChoiceReadResult<T> = {
	cancelled: boolean;
	submitted: boolean;
	submittedLabel: string;
	value: T | undefined;
};

export const lineSearchValue = async <T>(options: SearchPromptOptions<T>): Promise<T | undefined> => {
	const query = (await ask(options.message, options.hint)).trim();

	return resolveLineSearchChoice(options, query);
};

export const selectedSearchValue = <T>(choices: Array<Choice<T>>, highlighted: number | null): T | undefined => {
	if (highlighted === null) {
		return undefined;
	}

	const choice = choices[highlighted];

	return choice?.disabled ? undefined : choice?.value;
};

export const defaultSearchChoice = <T>(choices: Array<Choice<T>>, fallback?: T): Choice<T> | undefined => {
	if (fallback === undefined) {
		return undefined;
	}

	return choices.find((choice) => !choice.disabled && Object.is(choice.value, fallback));
};

export const cancelledSearchValue = <T>(choices: Array<Choice<T>>, highlighted: number | null, fallback?: T): T | undefined => {
	return selectedSearchValue(choices, highlighted) ?? fallback;
};
