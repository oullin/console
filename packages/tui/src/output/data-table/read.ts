import { promptEnvironment } from '#tui/environment';
import { readDataTableFallbackSelection } from '#tui/output/data-table/reader/fallback';
import { readDataTableSelectionInteractive } from '#tui/output/data-table/reader/interactive';
import { dataTableSelectionResult } from '#tui/output/data-table/reader/result';
import { createDataTableReaderSession } from '#tui/output/data-table/reader/session';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';

export const readDataTableSelection = async <T>(options: DataTableReadOptions<T>, headers: string[]): Promise<DataTableSelectionReadResult<T>> => {
	const environment = promptEnvironment();
	const session = createDataTableReaderSession(options, headers);

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			return dataTableSelectionResult(session.rows(), session.selected(), false);
		}

		return readDataTableFallbackSelection(options, headers);
	}

	return readDataTableSelectionInteractive(environment.input.readKey, options, headers);
};
