import { ask } from '#tui/prompt';
import { resolveLineSearchChoice } from '#tui/prompts/search/line-mode';
import type { Choice, SearchPromptOptions } from '#tui/types';

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

export const cancelledSearchValue = <T>(choices: Array<Choice<T>>, highlighted: number | null, fallback?: T): T | undefined => {
	return selectedSearchValue(choices, highlighted) ?? fallback;
};
