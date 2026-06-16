import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedTextDefault } from '#tui/prompts/text-default';
import { readTypedValue } from '#tui/typed-value';
import { renderSubmittedTextareaFrame } from '#tui/typed-value/textarea-frame';
import type { TextareaPromptOptions } from '#tui/types';

export const runTextareaPrompt = async (options: TextareaPromptOptions, fallbackRows: number): Promise<string> => {
	const validationOptions: TextareaPromptOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('textarea', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readTypedValue(options.message, {
					allowNewLine: true,
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
					rows: options.rows ?? fallbackRows,
				});

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedTextareaFrame(options.message, value);
				}
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
			},
		),
	);
};
