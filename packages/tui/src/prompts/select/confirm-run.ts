import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { transformedConfirmDefault, transformConfirmValue } from '#tui/prompts/select/confirm-options';
import { readConfirm } from '#tui/prompts/select/read-confirm';
import { renderSubmittedConfirm } from '#tui/prompts/select/render-confirm';
import type { NormalizedConfirmPromptOptions } from '#tui/prompts/select/confirm-options';
import type { ConfirmPromptOptions } from '#tui/types';

export const runConfirmPrompt = async (options: NormalizedConfirmPromptOptions): Promise<boolean> => {
	const validationOptions: ConfirmPromptOptions = {
		...options,
		default: await transformedConfirmDefault(options),
	};

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<void>(undefined);

	return promptWithFallback('confirm', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const answer = await readConfirm(options);

				activeFrame.set(answer.frame);
				submission.capture(answer.submitted, answer.cancelled, undefined);

				return transformConfirmValue(options, answer.value);
			},
			(value) => {
				activeFrame.clear();
				submission.render(() => {
					renderSubmittedConfirm(options, value);
				});
			},
			() => {
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
