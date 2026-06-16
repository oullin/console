import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
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

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('confirm', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readConfirm(options);

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = answer.submitted && !answer.cancelled;

				return transformConfirmValue(options, answer.value);
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedConfirm(options, value);
				}
			},
			activeFrame.clear,
		),
	);
};
