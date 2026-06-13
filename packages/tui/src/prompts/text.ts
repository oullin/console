import { textOptions } from '#tui/concerns/text-options';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { readTypedValue } from '#tui/typed-value';
import { renderSubmittedTypedValue } from '#tui/typed-value/render';
import type { TextPromptOptions } from '#tui/types';

export function text(options: TextPromptOptions): Promise<string>;

export function text(
	label: string,
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	transform?: TextPromptOptions['transform'],
): Promise<string>;

export async function text(
	message: string | TextPromptOptions,
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	transform: TextPromptOptions['transform'] = undefined,
): Promise<string> {
	const options = typeof message === 'string' ? textOptions({ message, label: message, placeholder, default: defaultValue, required, validate, hint, transform }) : textOptions(message);

	let shouldRenderSubmittedFrame = false;
	let activeFrame: string | undefined;

	return promptWithFallback('text', options, () =>
		promptUntilValid(
			options,
			async () => {
				const answer = await readTypedValue(options.message, {
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
				});

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame = answer.frame;
				shouldRenderSubmittedFrame = !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					if (activeFrame) {
						eraseRenderedFrame(activeFrame);
					}

					renderSubmittedTypedValue(options.message, value);
				}
			},
		),
	);
}
