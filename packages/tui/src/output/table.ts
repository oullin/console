import { promptEnvironment } from '#tui/environment';
import { parseTableOptions, tableRowCells } from '#tui/output/validators/table';
import { renderGrid } from '#tui/output/grid';
import { renderTable } from '#tui/theme';
import type { TableOptions } from '#tui/types';

export const table = (headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null): void => {
	const options = parseTableOptions(headersOrOptions, rows);

	const normalizedRows = options.rows.map((row) => tableRowCells(row, options.headers));

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
