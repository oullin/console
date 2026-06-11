import { promptEnvironment } from '#tui/environment';
import { parseTableOptions } from '#tui/output/validators/table';
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
	const width = Math.max(1, Math.trunc(maxWidth ?? 4));
	const rows: string[][] = [];

	for (let index = 0; index < items.length; index += width) {
		rows.push(items.slice(index, index + width).map(String));
	}

	promptEnvironment().output.write(rows.map((row) => row.join('  ')).join('\n'));
	promptEnvironment().output.write(items.length > 0 ? '\n' : '');
};

export const dataTable = table;
