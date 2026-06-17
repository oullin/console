import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { promptEnvironment } from '#tui/environment';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
import { dataTableValidationOptions, preserveDataTableRetryDefault, transformDataTableValue } from '#tui/output/data-table/options';
import { readDataTableSelection } from '#tui/output/data-table/read';
import { renderSubmittedDataTableFrame } from '#tui/output/data-table/render';
import { deriveDataTableHeaders } from '#tui/output/data-table/rows';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { NormalizedDataTablePromptOptions } from '#tui/output/data-table/options';

export const runDataTablePrompt = async <T>(options: NormalizedDataTablePromptOptions<T>): Promise<T | number> => {
	const validationOptions = await dataTableValidationOptions(options, !promptEnvironment().interactive);

	const headers = options.headers ?? deriveDataTableHeaders(options.rows);

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<DataTableSelectionReadResult<T> | null>(null);

	return promptWithFallback('datatable', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const selected = await readDataTableSelection(options, headers);

				activeFrame.set(selected.frame);
				submission.capture(selected.submitted, selected.cancelled, selected);
				preserveDataTableRetryDefault(options, selected.value);

				return transformDataTableValue(options, selected.value);
			},
			() => {
				activeFrame.clear();
				submission.render((selection) => {
					if (selection) {
						renderSubmittedDataTableFrame(options.message, headers, selection.rows, selection.selected);
					}
				});
			},
			() => {
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
