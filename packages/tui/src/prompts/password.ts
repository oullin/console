import { textOptions } from '#tui/concerns/text-options';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readPasswordValue } from '#tui/prompts/password/input';
import { renderSubmittedPasswordValue } from '#tui/prompts/password/render';
import { transformedTextDefault } from '#tui/prompts/text-default';
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

	const validationOptions: TextPromptOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('password', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readPasswordValue(options.message, {
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
				});

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = !answer.cancelled;

				return options.transform ? options.transform(answer.value) : answer.value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedPasswordValue(options.message, value);
				}
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
			},
		),
	);
}
