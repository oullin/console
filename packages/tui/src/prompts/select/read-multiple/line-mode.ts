import { ask } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { choicesFromCommaSeparated } from '#tui/prompts/select/multiple';
import { multipleChoicesValueResult } from '#tui/prompts/select/read-multiple/result';
import type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';
import type { Choice } from '#tui/types';

export const readLineMultipleChoices = async <T>(message: string, choices: Array<Choice<T>>, defaults: T[] = [], hint?: string): Promise<MultipleChoicesReadResult<T>> => {
	const rendered = renderChoices(choices);

	const answer = await ask(`${message}\n${rendered}\n`, hint);

	const value = answer.trim() === '' ? defaults : choicesFromCommaSeparated(choices, answer);

	return multipleChoicesValueResult(value);
};
