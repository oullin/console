import { isDataObjectRow } from '#tui/output/validators/data-table';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTablePromptOptions, DataTableRow, TableCell } from '#tui/types';

const stringify = (value: TableCell): string => {
	return value === null || value === undefined ? '' : String(value);
};

export const dataTableRowFields = <T>(row: DataTableRow<T>): Record<string, TableCell> => {
	if (Array.isArray(row)) {
		return Object.fromEntries(row.map((value, index) => [String(index), value]));
	}

	if (isDataObjectRow(row)) {
		return row.cells;
	}

	return row;
};

export const deriveDataTableHeaders = <T>(rows: Array<DataTableRow<T>>): string[] => {
	const first = rows[0];

	if (!first) {
		return [];
	}

	if (Array.isArray(first)) {
		return first.map((_, index) => String(index + 1));
	}

	return Object.keys(dataTableRowFields(first)).filter((key) => key !== 'value');
};

export const dataTableRowCells = <T>(headers: string[], row: DataTableRow<T>): string[] => {
	if (Array.isArray(row)) {
		return headers.length > 0 ? headers.map((_, index) => stringify(row[index])) : row.map(stringify);
	}

	const fields = dataTableRowFields(row);

	return headers.map((header) => stringify(fields[header]));
};

export const dataTableRowValue = <T>(row: DataTableRow<T>, index: number): T | number => {
	if (isDataObjectRow(row) && row.value !== undefined) {
		return row.value;
	}

	if (!Array.isArray(row) && 'value' in row && row.value !== undefined) {
		return row.value as T;
	}

	return index;
};

export const dataTableRowLabel = <T>(headers: string[], row: DataTableRow<T>): string => dataTableRowCells(headers, row).join(' ');

export const visibleDataTableRows = <T>(options: DataTablePromptOptions<T>, headers: string[], query: string): Array<VisibleDataTableRow<T>> => {
	return options.rows.map((row, index) => ({ index, row })).filter(({ row }) => options.filter?.(query, row) ?? dataTableRowLabel(headers, row).toLowerCase().includes(query.toLowerCase()));
};
