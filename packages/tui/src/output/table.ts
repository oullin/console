import { promptEnvironment } from '#tui/environment';
import { parseTableOptions } from '#tui/output/validators/table';
import { renderGrid } from '#tui/output/grid';
import { renderTable } from '#tui/theme';
import type { TableOptions } from '#tui/types';

const stringify = (value: string | number | boolean | null | undefined): string => {
	return value === null || value === undefined ? '' : String(value);
};

export const table = (headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null): void => {
	const options = parseTableOptions(headersOrOptions, rows);

	const normalizedRows = options.rows.map((row) => {
		if (Array.isArray(row)) {
			return row.map(stringify);
		}

		return options.headers.map((header) => stringify(row[header]));
	});

	promptEnvironment().output.write(`${renderTable(options.headers, normalizedRows)}\n`);
};

export const grid = (items: Array<string | number | boolean> = [], maxWidth?: number): void => {
	const rendered = renderGrid(items, maxWidth);

	if (rendered === '') {
		return;
	}

	promptEnvironment().output.write(`${rendered}\n`);
};

export const dataTable = table;
