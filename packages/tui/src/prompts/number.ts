import { promptEnvironment } from '#tui/environment';
import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readNumberValue } from '#tui/prompts/number/input';
import { renderSubmittedNumberValue } from '#tui/prompts/number/render';
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
	transform?: NumberPromptOptions['transform'],
): Promise<number | string>;

export async function number(
	message: string | NumberPromptOptions,
	placeholder = '',
	defaultValue: number | string = '',
	required: boolean | string = false,
	validate: NumberPromptOptions['validate'] = undefined,
	hint = '',
	min: number | undefined = undefined,
	max: number | undefined = undefined,
	step: number | undefined = undefined,
	transform: NumberPromptOptions['transform'] = undefined,
): Promise<number | string> {
	const options: NumberPromptOptions =
		typeof message === 'string'
			? { message, label: message, placeholder, default: defaultValue, required, validate, hint, min, max, step, transform }
			: { ...message, default: message.default ?? '' };

	return promptUntilValid(options, async () => {
		const shouldRenderSubmittedFrame = Boolean(promptEnvironment().input.readKey);

		const answer = await readNumberValue(options.message, {
			default: options.default,
			hint: options.hint,
			max: options.max,
			min: options.min,
			placeholder: options.placeholder,
			step: options.step,
		});

		const value = answer.value;

		if (value === '' && options.default !== undefined) {
			if (shouldRenderSubmittedFrame && !answer.cancelled) {
				renderSubmittedNumberValue(options.message, options.default);
			}

			return options.default;
		}

		const result = parseNumberInput(value, options);

		if (result.error !== undefined) {
			throw new PromptValidationError(result.error);
		}

		const parsedValue = result.value ?? '';

		if (shouldRenderSubmittedFrame && !answer.cancelled) {
			renderSubmittedNumberValue(options.message, parsedValue);
		}

		return options.transform ? options.transform(parsedValue) : parsedValue;
	});
}
