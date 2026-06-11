import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readNumberValue } from '#tui/prompts/number/input';
import { parseNumberInput } from '#tui/prompts/number/validators/value';
import type { NumberPromptOptions } from '#tui/types';

export function number(options: NumberPromptOptions): Promise<number | string>;

export function number(
	label: string,
	placeholder?: string,
	defaultValue?: number | string,
	required?: boolean | string,
	validate?: NumberPromptOptions['validate'],
	hint?: string,
	min?: number,
	max?: number,
	step?: number,
): Promise<number | string>;

export async function number(
	message: string | NumberPromptOptions,
	_placeholder = '',
	defaultValue: number | string | undefined = undefined,
	required: boolean | string = false,
	validate: NumberPromptOptions['validate'] = undefined,
	hint = '',
	min: number | undefined = undefined,
	max: number | undefined = undefined,
	step: number | undefined = undefined,
): Promise<number | string> {
	const options: NumberPromptOptions = typeof message === 'string' ? { message, label: message, default: defaultValue, required, validate, hint, min, max, step } : { ...message };

	return promptUntilValid(options, async () => {
		const answer = await readNumberValue(options.message, {
			default: options.default,
			hint: options.hint,
			max: options.max,
			min: options.min,
			step: options.step,
		});

		if (answer === '' && options.default !== undefined) {
			return options.default;
		}

		const result = parseNumberInput(answer, options);

		if (result.error !== undefined) {
			throw new PromptValidationError(result.error);
		}

		return options.transform ? options.transform(result.value ?? '') : (result.value ?? '');
	});
}
