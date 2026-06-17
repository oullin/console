import { normalizeChoices } from '#tui/concerns/choices';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { preserveSelectRetryDefault, transformSelectValue, transformedSelectDefault } from '#tui/prompts/select/defaults';
import { readSelectedChoice } from '#tui/prompts/select/read-selected';
import { renderSubmittedChoice } from '#tui/prompts/select/render';
import { assertSelectOptions } from '#tui/prompts/select/validators/options';
import type { NormalizedSelectPromptOptions } from '#tui/prompts/select/defaults';
import type { SelectPromptOptions } from '#tui/types';

export const runSelectPrompt = async <T>(options: NormalizedSelectPromptOptions<T>): Promise<T> => {
	assertSelectOptions(options);

	const promptOptions: NormalizedSelectPromptOptions<T> = { ...options, required: options.required ?? true };

	const validationOptions: SelectPromptOptions<T> = {
		...promptOptions,
		default: await transformedSelectDefault(promptOptions),
	};

	const choices = normalizeChoices(options.options);
	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState('');

	return promptWithFallback('select', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const selected = await readSelectedChoice(
					promptOptions.message,
					choices,
					promptOptions.default,
					promptOptions.hasDefault,
					promptOptions.hint,
					promptOptions.scroll,
					promptOptions.info,
				);

				activeFrame.set(selected.frame);
				submission.capture(selected.submitted, selected.cancelled, selected.submittedLabel);
				preserveSelectRetryDefault(promptOptions, selected.value);

				return transformSelectValue(promptOptions, selected.value);
			},
			() => {
				activeFrame.clear();
				submission.render((label) => {
					renderSubmittedChoice(promptOptions.message, label);
				});
			},
			() => {
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
