import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedTextDefault } from '#tui/prompts/text-default';
import { readTypedValue } from '#tui/typed-value';
import { renderSubmittedTypedValue } from '#tui/typed-value/render';
import type { TextPromptOptions } from '#tui/types';

export const runTextPrompt = async (options: TextPromptOptions): Promise<string> => {
	const validationOptions: TextPromptOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('text', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readTypedValue(options.message, {
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
				});

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedTypedValue(options.message, value);
				}
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
			},
		),
	);
};
