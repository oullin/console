import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { preserveMultiSearchRetryDefault, transformedMultiSearchDefault } from '#tui/prompts/search/defaults';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { renderSubmittedSearchChoices } from '#tui/prompts/search/render';
import type { NormalizedMultiSearchPromptOptions } from '#tui/prompts/search/multi-options';
import type { MultiSearchPromptOptions } from '#tui/types';

export const runMultiSearchPrompt = async <T>(options: NormalizedMultiSearchPromptOptions<T>): Promise<T[]> => {
	const validationOptions: MultiSearchPromptOptions<T> = {
		...options,
		default: await transformedMultiSearchDefault(options),
	};

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<string[]>([]);

	return promptWithFallback('multisearch', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const selected = await readMultiSearchChoices(options);

				activeFrame.set(selected.frame);
				submission.capture(selected.submitted, selected.cancelled, selected.submittedLabels);
				preserveMultiSearchRetryDefault(options, selected.value);

				return options.transform ? options.transform(selected.value) : selected.value;
			},
			() => {
				activeFrame.clear();
				submission.render((labels) => {
					renderSubmittedSearchChoices(options.message, labels);
				});
			},
			() => {
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
