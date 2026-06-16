import { promptUntilValid, promptWithFallback, PromptValidationError } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformSearchValue, transformedSearchDefault } from '#tui/prompts/search/defaults';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import { renderSubmittedSearchChoice } from '#tui/prompts/search/render';
import type { NormalizedSearchPromptOptions } from '#tui/prompts/search/defaults';
import type { SearchPromptOptions } from '#tui/types';

export const runSearchPrompt = async <T>(options: NormalizedSearchPromptOptions<T>): Promise<T> => {
	const validationOptions: SearchPromptOptions<T> = {
		...options,
		default: await transformedSearchDefault(options),
	};

	let shouldRenderSubmittedFrame = false;
	let submittedLabel = '';

	const activeFrame = activePromptFrame();

	return promptWithFallback('search', options, () =>
		promptUntilValid(
			validationOptions,
			async (attempt) => {
				const selected = await readSearchChoice(options, attempt);

				if (selected.value === undefined) {
					throw new PromptValidationError('Please select a valid option.');
				}

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabel = selected.submittedLabel;

				return transformSearchValue(options, selected.value);
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedSearchChoice(options.message, submittedLabel);
				}
			},
			activeFrame.clear,
		),
	);
};
