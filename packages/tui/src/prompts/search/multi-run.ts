import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedMultiSearchDefault } from '#tui/prompts/search/defaults';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { renderSubmittedSearchChoices } from '#tui/prompts/search/render';
import type { NormalizedMultiSearchPromptOptions } from '#tui/prompts/search/multi-options';
import type { MultiSearchPromptOptions } from '#tui/types';

export const runMultiSearchPrompt = async <T>(options: NormalizedMultiSearchPromptOptions<T>): Promise<T[]> => {
	const validationOptions: MultiSearchPromptOptions<T> = {
		...options,
		default: await transformedMultiSearchDefault(options),
	};

	let shouldRenderSubmittedFrame = false;
	let submittedLabels: string[] = [];

	const activeFrame = activePromptFrame();

	return promptWithFallback('multisearch', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readMultiSearchChoices(options);

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabels = selected.submittedLabels;

				return options.transform ? options.transform(selected.value) : selected.value;
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedSearchChoices(options.message, submittedLabels);
				}
			},
			activeFrame.clear,
		),
	);
};
