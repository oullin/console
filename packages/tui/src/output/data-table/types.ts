import type { DataTableRow } from '#tui/types';

export type VisibleDataTableRow<T> = {
	index: number;
	row: DataTableRow<T>;
};

export type DataTableSelectionReadResult<T> = {
	cancelled: boolean;
	rows: Array<VisibleDataTableRow<T>>;
	selected: number;
	submitted: boolean;
	value: T | number;
};
