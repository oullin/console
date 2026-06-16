import { normalizeChoices } from '#tui/concerns/choices';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
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

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<string[]>([]);

	return promptWithFallback('multiselect', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const selected = await readMultipleChoices(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info);

				activeFrame.set(selected.frame);
				submission.capture(selected.submitted, selected.cancelled, selected.submittedLabels);

				return promptOptions.transform ? promptOptions.transform(selected.value) : selected.value;
			},
			() => {
				activeFrame.clear();
				submission.render((labels) => {
					renderSubmittedChoices(promptOptions.message, labels);
				});
			},
			() => {
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
