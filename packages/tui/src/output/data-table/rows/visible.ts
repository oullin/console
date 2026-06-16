import { dataTableRowLabel } from '#tui/output/data-table/rows/fields';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTablePromptOptions } from '#tui/types';

export const visibleDataTableRows = <T>(options: DataTablePromptOptions<T>, headers: string[], query: string): Array<VisibleDataTableRow<T>> => {
	const rows = options.rows.map((row, index) => ({ index, row }));

	if (query === '') {
		return rows;
	}

	return rows.filter(({ row }) => options.filter?.(query, row) ?? dataTableRowLabel(headers, row).toLowerCase().includes(query.toLowerCase()));
};
