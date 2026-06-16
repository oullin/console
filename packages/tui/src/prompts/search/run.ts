import { promptUntilValid, promptWithFallback, PromptValidationError } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { preserveSearchRetryDefault, transformSearchValue, transformedSearchDefault } from '#tui/prompts/search/defaults';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import { renderSubmittedSearchChoice } from '#tui/prompts/search/render';
import type { NormalizedSearchPromptOptions } from '#tui/prompts/search/defaults';
import type { SearchPromptOptions } from '#tui/types';

export const runSearchPrompt = async <T>(options: NormalizedSearchPromptOptions<T>): Promise<T> => {
	const validationOptions: SearchPromptOptions<T> = {
		...options,
		default: await transformedSearchDefault(options),
	};

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState('');

	return promptWithFallback('search', options, () =>
		promptUntilValid(
			validationOptions,
			async (attempt) => {
				submission.reset();

				const selected = await readSearchChoice(options, attempt);

				activeFrame.set(selected.frame);

				if (selected.value === undefined) {
					throw new PromptValidationError('Please select a valid option.');
				}

				submission.capture(selected.submitted, selected.cancelled, selected.submittedLabel);
				preserveSearchRetryDefault(options, selected.value);

				return transformSearchValue(options, selected.value);
			},
			() => {
				activeFrame.clear();
				submission.render((label) => {
					renderSubmittedSearchChoice(options.message, label);
				});
			},
			() => {
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
