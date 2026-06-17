import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { transformedTextDefault } from '#tui/prompts/text-default';
import { readTypedValue } from '#tui/typed-value';
import { renderSubmittedTypedValue } from '#tui/typed-value/render';
import type { TextPromptOptions } from '#tui/types';

export const runTextPrompt = async (options: TextPromptOptions): Promise<string> => {
	const validationOptions: TextPromptOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<void>(undefined);

	return promptWithFallback('text', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const answer = await readTypedValue(options.message, {
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
				});

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				submission.capture(!answer.cancelled, answer.cancelled, undefined);

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				activeFrame.clear();
				submission.render(() => {
					renderSubmittedTypedValue(options.message, value);
				});
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
