import { number } from '#tui/prompts/basic';
import { numberOptionsWithPreviousDefault } from '#tui/form/builder/prompts/basic/number/defaults';
import type { NumberPromptOptions } from '#tui/types';

export const runObjectNumberFormStep = (options: NumberPromptOptions, previous: unknown): Promise<number | string> => {
	return number(numberOptionsWithPreviousDefault(options, previous));
};

export const runLabelNumberFormStep = (options: NumberPromptOptions): Promise<number | string> => {
	return number(options);
};
