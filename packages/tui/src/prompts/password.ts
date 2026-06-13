import { textOptions } from '#tui/concerns/text-options';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { readPasswordValue } from '#tui/prompts/password/input';
import { renderSubmittedPasswordValue } from '#tui/prompts/password/render';
import type { TextPromptOptions } from '#tui/types';

export function password(options: TextPromptOptions): Promise<string>;

export function password(
	label: string,
	placeholder?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	transform?: TextPromptOptions['transform'],
): Promise<string>;

export async function password(
	message: string | TextPromptOptions,
	placeholder = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	transform: TextPromptOptions['transform'] = undefined,
): Promise<string> {
	const options = typeof message === 'string' ? textOptions({ message, label: message, placeholder, required, validate, hint, transform }) : textOptions(message);

	let shouldRenderSubmittedFrame = false;
	let activeFrame: string | undefined;

	return promptWithFallback('password', options, () =>
		promptUntilValid(
			options,
			async () => {
				const answer = await readPasswordValue(options.message, {
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
				});

				activeFrame = answer.frame;
				shouldRenderSubmittedFrame = !answer.cancelled;

				return options.transform ? options.transform(answer.value) : answer.value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					if (activeFrame) {
						eraseRenderedFrame(activeFrame);
					}

					renderSubmittedPasswordValue(options.message, value);
				}
			},
		),
	);
}
