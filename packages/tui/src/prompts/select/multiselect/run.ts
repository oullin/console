import { normalizeChoices } from '#tui/concerns/choices';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedMultiSelectDefault } from '#tui/prompts/select/defaults';
import { readMultipleChoices } from '#tui/prompts/select/read-multiple';
import { renderSubmittedChoices } from '#tui/prompts/select/render';
import type { NormalizedMultiSelectPromptOptions } from '#tui/prompts/select/multiselect/options';

export const runMultiSelectPrompt = async <T>(promptOptions: NormalizedMultiSelectPromptOptions<T>): Promise<T[]> => {
	const validationOptions: NormalizedMultiSelectPromptOptions<T> = {
		...promptOptions,
		default: await transformedMultiSelectDefault(promptOptions),
	};

	const choices = normalizeChoices(promptOptions.options);

	let shouldRenderSubmittedFrame = false;
	let submittedLabels: string[] = [];

	const activeFrame = activePromptFrame();

	return promptWithFallback('multiselect', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readMultipleChoices(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info);

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabels = selected.submittedLabels;

				return promptOptions.transform ? promptOptions.transform(selected.value) : selected.value;
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedChoices(promptOptions.message, submittedLabels);
				}
			},
			activeFrame.clear,
		),
	);
};
