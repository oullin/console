import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderCancelledDataTableFrame } from '#tui/output/data-table/render';
import { assertSelectedDataTableRow, selectedDataTableValue } from '#tui/output/data-table/reader/result';
import type { DataTableSelectionReadResult, VisibleDataTableRow } from '#tui/output/data-table/types';

export const cancelDataTableSelection = async <T>(
	message: string,
	headers: string[],
	rows: Array<VisibleDataTableRow<T>>,
	selected: number,
	frame: string,
): Promise<DataTableSelectionReadResult<T>> => {
	assertSelectedDataTableRow(rows, selected, frame);
	eraseRenderedFrame(frame);
	renderCancelledDataTableFrame(message, headers, rows, selected);

	return {
		cancelled: true,
		rows,
		selected,
		submitted: false,
		value: await cancelPrompt(selectedDataTableValue(rows, selected)),
	};
};
