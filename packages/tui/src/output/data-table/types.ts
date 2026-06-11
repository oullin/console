import type { DataTableRow } from '#tui/types';

export type VisibleDataTableRow<T> = {
	index: number;
	row: DataTableRow<T>;
};
