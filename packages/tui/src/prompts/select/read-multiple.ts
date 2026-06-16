import { promptEnvironment } from '#tui/environment';
import { readMultipleChoicesInteractive } from '#tui/prompts/select/read-multiple/interactive';
import { readLineMultipleChoices } from '#tui/prompts/select/read-multiple/line-mode';
import type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export type { MultipleChoicesReadResult } from '#tui/prompts/select/read-multiple/types';

export const readMultipleChoices = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaults: T[] = [],
	hint?: string,
	scroll?: number,
	info?: MultiSelectPromptOptions<T>['info'],
): Promise<MultipleChoicesReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return readLineMultipleChoices(message, choices, defaults, hint);
	}

	return readMultipleChoicesInteractive(environment.input.readKey, message, choices, defaults, scroll, info);
};
