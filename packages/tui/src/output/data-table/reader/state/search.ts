import { applyDataTableSearchKey, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableSearchChange, DataTableSearchState } from '#tui/output/data-table/search';

export type DataTableReaderSearchChange = DataTableSearchChange;

export const applyDataTableReaderSearchKey = (
	state: DataTableSearchState,
	key: string,
): DataTableReaderSearchChange => {
	return applyDataTableSearchKey(state, key);
};

export const beginDataTableReaderSearch = (): DataTableSearchState => {
	return startDataTableSearch();
};
