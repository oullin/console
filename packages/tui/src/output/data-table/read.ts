import { promptEnvironment } from '#tui/environment';
import { readDataTableFallbackSelection } from '#tui/output/data-table/reader/fallback';
import { readDataTableSelectionInteractive } from '#tui/output/data-table/reader/interactive';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';

export const readDataTableSelection = async <T>(options: DataTableReadOptions<T>, headers: string[]): Promise<DataTableSelectionReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return readDataTableFallbackSelection(options, headers);
	}

	return readDataTableSelectionInteractive(environment.input.readKey, options, headers);
};
