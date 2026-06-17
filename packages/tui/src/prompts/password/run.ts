import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { readPasswordValue } from '#tui/prompts/password/input';
import { renderSubmittedPasswordValue } from '#tui/prompts/password/render';
import { transformedTextDefault } from '#tui/prompts/text-default';
import type { TextPromptOptions } from '#tui/types';

export const runPasswordPrompt = async (options: TextPromptOptions): Promise<string> => {
	const validationOptions: TextPromptOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<void>(undefined);

	return promptWithFallback('password', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const answer = await readPasswordValue(options.message, {
					default: options.default,
					hint: options.hint,
					placeholder: options.placeholder,
				});

				activeFrame.set(answer.frame);
				submission.capture(!answer.cancelled, answer.cancelled, undefined);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				activeFrame.clear();
				submission.render(() => {
					renderSubmittedPasswordValue(options.message, value);
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
