import { promptEnvironment } from '#tui/environment';
import { readNumberFallbackValue } from '#tui/prompts/number/fallback';
import { readInteractiveNumberValue } from '#tui/prompts/number/interactive';
import type { NumberInputOptions, NumberReadResult } from '#tui/prompts/number/types';

export const readNumberValue = async (message: string, options: NumberInputOptions = {}): Promise<NumberReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return readNumberFallbackValue(message, options);
	}

	return readInteractiveNumberValue(message, options);
};
