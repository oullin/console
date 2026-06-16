import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readPasswordValue } from '#tui/prompts/password/input';
import { renderSubmittedPasswordValue } from '#tui/prompts/password/render';
import { transformedTextDefault } from '#tui/prompts/text-default';
import type { TextPromptOptions } from '#tui/types';

export const runPasswordPrompt = async (options: TextPromptOptions): Promise<string> => {
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
};
