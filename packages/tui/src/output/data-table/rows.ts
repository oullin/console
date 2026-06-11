import { parseDataTableRowShape } from '#tui/output/validators/data-table';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTablePromptOptions, DataTableRow, TableCell } from '#tui/types';

const stringify = (value: TableCell): string => {
	return value === null || value === undefined ? '' : String(value);
};

export const dataTableRowFields = <T>(row: DataTableRow<T>): Record<string, TableCell> => {
	const shape = parseDataTableRowShape(row);

	if (shape.kind === 'array') {
		return Object.fromEntries(shape.row.map((value, index) => [String(index), value]));
	}

	if (shape.kind === 'object') {
		return shape.row.cells;
	}

	return shape.row;
};

export const deriveDataTableHeaders = <T>(rows: Array<DataTableRow<T>>): string[] => {
	const first = rows[0];

	if (!first) {
		return [];
	}

	const shape = parseDataTableRowShape(first);

	if (shape.kind === 'array') {
		return shape.row.map((_, index) => String(index + 1));
	}

	return Object.keys(dataTableRowFields(first)).filter((key) => key !== 'value');
};

export const dataTableRowCells = <T>(headers: string[], row: DataTableRow<T>): string[] => {
	const shape = parseDataTableRowShape(row);

	if (shape.kind === 'array') {
		return headers.length > 0 ? headers.map((_, index) => stringify(shape.row[index])) : shape.row.map(stringify);
	}

	const fields = dataTableRowFields(row);

	return headers.map((header) => stringify(fields[header]));
};

export const dataTableRowValue = <T>(row: DataTableRow<T>, index: number): T | number => {
	const shape = parseDataTableRowShape(row);

	if (shape.kind === 'object' && shape.row.value !== undefined) {
		return shape.row.value;
	}

	if (shape.kind === 'record' && shape.row.value !== undefined) {
		return shape.row.value as T;
	}

	return index;
};

export const dataTableRowLabel = <T>(headers: string[], row: DataTableRow<T>): string => dataTableRowCells(headers, row).join(' ');

export const visibleDataTableRows = <T>(options: DataTablePromptOptions<T>, headers: string[], query: string): Array<VisibleDataTableRow<T>> => {
	return options.rows.map((row, index) => ({ index, row })).filter(({ row }) => options.filter?.(query, row) ?? dataTableRowLabel(headers, row).toLowerCase().includes(query.toLowerCase()));
};
