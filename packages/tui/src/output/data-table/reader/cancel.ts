import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderCancelledDataTableFrame } from '#tui/output/data-table/render';
import { dataTableRowValue } from '#tui/output/data-table/rows';
import { selectedDataTableValue } from '#tui/output/data-table/reader/result';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';
import type { DataTableSearchMode } from '#tui/output/data-table/search';
import type { DataTableSelectionReadResult, VisibleDataTableRow } from '#tui/output/data-table/types';

const cancelledDataTableValue = <T>(
	options: DataTableReadOptions<T>,
	rows: Array<VisibleDataTableRow<T>>,
	selected: number,
): T | number => {
	if (rows[selected] !== undefined) {
		return selectedDataTableValue(rows, selected);
	}

	if (options.hasDefault === true && options.default !== undefined) {
		return options.default;
	}

	return dataTableRowValue(options.rows[0], 0);
};

export const cancelDataTableSelection = async <T>(
	options: DataTableReadOptions<T>,
	headers: string[],
	rows: Array<VisibleDataTableRow<T>>,
	selected: number,
	frame: string,
	mode: DataTableSearchMode,
	query: string,
): Promise<DataTableSelectionReadResult<T>> => {
	const value = cancelledDataTableValue(options, rows, selected);

	eraseRenderedFrame(frame);
	renderCancelledDataTableFrame(options.message, headers, rows, selected, mode, query);

	return {
		cancelled: true,
		rows,
		selected,
		submitted: false,
		value: await cancelPrompt(value),
	};
};
