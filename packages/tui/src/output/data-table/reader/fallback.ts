import { ask } from '#tui/prompt/ask';
import { visibleDataTableRows } from '#tui/output/data-table/rows';
import { assertSelectedDataTableRow, dataTableSelectionResult, initialDataTableSelection } from '#tui/output/data-table/reader/result';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';

export const readDataTableFallbackSelection = async <T>(options: DataTableReadOptions<T>, headers: string[]): Promise<DataTableSelectionReadResult<T>> => {
	const answer = await ask(options.message, options.hint);
	const query = answer.trim();

	const rows = visibleDataTableRows(options, headers, query);
	const selected = query === '' ? initialDataTableSelection(rows, options.default, options.hasDefault) : 0;

	assertSelectedDataTableRow(rows, selected, '');

	return dataTableSelectionResult(rows, selected, false);
};
