import { PromptValidationError } from '#tui/prompt';
import { parseNumberInput } from '#tui/prompts/number/validators/value';
import type { NumberPromptOptions } from '#tui/types';

export type NormalizedNumberPromptOptions = NumberPromptOptions & {
	default: number | string;
	hasDefault: boolean;
};

export const transformNumberValue = async (options: Pick<NumberPromptOptions, 'transform'>, value: number | string): Promise<number | string> => {
	return options.transform ? options.transform(value) : value;
};

export const numberDefault = async (options: NormalizedNumberPromptOptions): Promise<number | string> => {
	if (!options.hasDefault) {
		return '';
	}

	const result = parseNumberInput(String(options.default), options);

	if (result.error !== undefined) {
		throw new PromptValidationError(result.error);
	}

	return transformNumberValue(options, result.value ?? '');
};
