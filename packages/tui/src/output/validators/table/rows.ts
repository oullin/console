import { z } from 'zod';
import { tableCellSchema } from '#tui/output/validators/table/schemas';
import type { TableCell, TableOptions } from '#tui/types';

export const inferredTableHeaders = (rows: TableOptions['rows']): string[] => {
	const firstRow = rows[0];

	const arrayRow = z.array(tableCellSchema).safeParse(firstRow);

	if (arrayRow.success || firstRow === undefined) {
		return [];
	}

	return Object.keys(firstRow);
};

export const stringifyTableCell = (value: TableCell): string => {
	return value === null || value === undefined ? '' : String(value);
};

export const tableRowCells = (row: TableOptions['rows'][number], headers: string[]): string[] => {
	const arrayRow = z.array(tableCellSchema).safeParse(row);

	if (arrayRow.success) {
		return arrayRow.data.map(stringifyTableCell);
	}

	const recordRow = z.record(z.string(), tableCellSchema).parse(row);

	return headers.map((header) => stringifyTableCell(recordRow[header]));
};
