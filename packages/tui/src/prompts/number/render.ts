import { promptEnvironment } from '#tui/environment';
import { renderQuestion } from '#tui/theme';
import type { NumberInputOptions } from '#tui/prompts/number/types';

export const renderNumberValue = (message: string, value: string, options: NumberInputOptions): void => {
	const displayValue = value.length > 0 ? value : (options.placeholder ?? '');

	promptEnvironment().output.write(`${renderQuestion(message, options.hint)}${displayValue}\n`);
};
