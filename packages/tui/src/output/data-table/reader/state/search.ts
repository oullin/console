import { applyDataTableSearchKey, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableSearchState } from '#tui/output/data-table/search';

export type DataTableReaderSearchChange = {
	changed: boolean;
	state: DataTableSearchState;
};

export const applyDataTableReaderSearchKey = (
	state: DataTableSearchState,
	key: string,
): DataTableReaderSearchChange => {
	return applyDataTableSearchKey(state, key);
};

export const beginDataTableReaderSearch = (): DataTableSearchState => {
	return startDataTableSearch();
};
