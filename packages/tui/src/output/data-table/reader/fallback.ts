import { ask } from '#tui/prompt/ask';
import { visibleDataTableRows } from '#tui/output/data-table/rows';
import { assertSelectedDataTableRow, dataTableSelectionResult } from '#tui/output/data-table/reader/result';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { DataTablePromptOptions } from '#tui/types';

export const readDataTableFallbackSelection = async <T>(options: DataTablePromptOptions<T>, headers: string[]): Promise<DataTableSelectionReadResult<T>> => {
	const answer = await ask(options.message);

	const rows = visibleDataTableRows(options, headers, answer);

	assertSelectedDataTableRow(rows, 0, '');

	return dataTableSelectionResult(rows, 0, false);
};
