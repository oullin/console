import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { dataTableValidationOptions, transformDataTableValue } from '#tui/output/data-table/options';
import { readDataTableSelection } from '#tui/output/data-table/read';
import { renderSubmittedDataTableFrame } from '#tui/output/data-table/render';
import { deriveDataTableHeaders } from '#tui/output/data-table/rows';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { NormalizedDataTablePromptOptions } from '#tui/output/data-table/options';

export const runDataTablePrompt = async <T>(options: NormalizedDataTablePromptOptions<T>): Promise<T | number> => {
	const validationOptions = await dataTableValidationOptions(options);
	const headers = options.headers ?? deriveDataTableHeaders(options.rows);

	let submittedSelection: DataTableSelectionReadResult<T> | null = null;

	const activeFrame = activePromptFrame();

	return promptWithFallback('datatable', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readDataTableSelection(options, headers);

				activeFrame.set(selected.frame);
				submittedSelection = selected.submitted && !selected.cancelled ? selected : null;

				return transformDataTableValue(options, selected.value);
			},
			() => {
				if (submittedSelection) {
					activeFrame.clear();
					renderSubmittedDataTableFrame(options.message, headers, submittedSelection.rows, submittedSelection.selected);
				}
			},
			activeFrame.clear,
		),
	);
};
