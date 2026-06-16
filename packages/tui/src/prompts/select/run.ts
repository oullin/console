import { normalizeChoices } from '#tui/concerns/choices';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformSelectValue, transformedSelectDefault } from '#tui/prompts/select/defaults';
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

	let shouldRenderSubmittedFrame = false;
	let submittedLabel = '';

	const activeFrame = activePromptFrame();

	return promptWithFallback('select', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
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
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabel = selected.submittedLabel;

				return transformSelectValue(promptOptions, selected.value);
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedChoice(promptOptions.message, submittedLabel);
				}
			},
			activeFrame.clear,
		),
	);
};
