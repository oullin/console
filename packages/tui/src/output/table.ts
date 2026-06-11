import { promptEnvironment } from '#tui/environment';
import { renderTable } from '#tui/theme';
import type { TableOptions } from '#tui/types';

const stringify = (value: string | number | boolean | null | undefined): string => {
	return value === null || value === undefined ? '' : String(value);
};

const normalizeTableOptions = (headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null): Required<TableOptions> => {
	if (!Array.isArray(headersOrOptions) && 'rows' in headersOrOptions) {
		const headers = headersOrOptions.headers ?? Object.keys(headersOrOptions.rows[0] ?? {});

		return { headers, rows: headersOrOptions.rows };
	}

	return {
		headers: headersOrOptions,
		rows: rows ?? [],
	};
};

export const table = (headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null): boolean => {
	const options = normalizeTableOptions(headersOrOptions, rows);

	const normalizedRows = options.rows.map((row) => {
		if (Array.isArray(row)) {
			return row.map(stringify);
		}

		return options.headers.map((header) => stringify(row[header]));
	});

	promptEnvironment().output.write(`${renderTable(options.headers, normalizedRows)}\n`);

	return true;
};

export const grid = (items: Array<string | number | boolean> = [], maxWidth?: number): boolean => {
	const width = maxWidth ?? 4;
	const rows: string[][] = [];

	for (let index = 0; index < items.length; index += width) {
		rows.push(items.slice(index, index + width).map(String));
	}

	promptEnvironment().output.write(rows.map((row) => row.join('  ')).join('\n'));
	promptEnvironment().output.write(items.length > 0 ? '\n' : '');

	return true;
};

export const dataTable = table;
