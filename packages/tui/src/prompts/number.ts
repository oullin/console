import { promptUntilValid, promptWithFallback, PromptValidationError } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { numberDefault, transformNumberValue } from '#tui/prompts/number/defaults';
import { readNumberValue } from '#tui/prompts/number/input';
import { renderSubmittedNumberValue } from '#tui/prompts/number/render';
import { parseNumberInput } from '#tui/prompts/number/validators/value';
import { hasPromptDefault } from '#tui/validators/default';
import type { NormalizedNumberPromptOptions } from '#tui/prompts/number/defaults';
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
	const hasDefault = typeof message === 'string' ? arguments.length >= 3 && defaultValue !== undefined : hasPromptDefault(message);

	const options: NormalizedNumberPromptOptions =
		typeof message === 'string'
			? { message, label: message, placeholder, default: hasDefault ? defaultValue : '', hasDefault, required, validate, hint, min, max, step, transform }
			: { ...message, default: hasDefault ? (message.default as number | string) : '', hasDefault };

	const validationOptions: NumberPromptOptions = {
		...options,
		default: await numberDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('number', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readNumberValue(options.message, {
					default: options.default,
					hasDefault: options.hasDefault,
					hint: options.hint,
					max: options.max,
					min: options.min,
					placeholder: options.placeholder,
					step: options.step,
				});

				const value = answer.value;

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = !answer.cancelled;

				if (value === '' && options.hasDefault) {
					return numberDefault(options);
				}

				const result = parseNumberInput(value, options);

				if (result.error !== undefined) {
					throw new PromptValidationError(result.error);
				}

				const parsedValue = result.value ?? '';

				return transformNumberValue(options, parsedValue);
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedNumberValue(options.message, value);
				}
			},
			activeFrame.clear,
		),
	);
}
