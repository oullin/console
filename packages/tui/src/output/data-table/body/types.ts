import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTableRow } from '#tui/types';

export type DataTableBodyOptions<T> = {
	allRows: Array<DataTableRow<T>>;
	headers: string[];
	query: string;
	rows: Array<VisibleDataTableRow<T>>;
	scroll?: number;
	selected: number;
};
