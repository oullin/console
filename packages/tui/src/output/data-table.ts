import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { parseOptionalScrollSize, parseScrollSize } from '#tui/concerns/validators/scroll';
import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { renderTable } from '#tui/theme';
import { isDataObjectRow } from '#tui/output/validators/data-table';
import type { DataTablePromptOptions, DataTableRow, TableCell } from '#tui/types';

type VisibleRow<T> = {
	index: number;
	row: DataTableRow<T>;
};

const stringify = (value: TableCell): string => {
	return value === null || value === undefined ? '' : String(value);
};

const rowFields = <T>(row: DataTableRow<T>): Record<string, TableCell> => {
	if (Array.isArray(row)) {
		return Object.fromEntries(row.map((value, index) => [String(index), value]));
	}

	if (isDataObjectRow(row)) {
		return row.cells;
	}

	return row;
};

const derivedHeaders = <T>(rows: Array<DataTableRow<T>>): string[] => {
	const first = rows[0];

	if (!first) {
		return [];
	}

	if (Array.isArray(first)) {
		return first.map((_, index) => String(index + 1));
	}

	return Object.keys(rowFields(first)).filter((key) => key !== 'value');
};

const rowCells = <T>(headers: string[], row: DataTableRow<T>): string[] => {
	if (Array.isArray(row)) {
		return headers.length > 0 ? headers.map((_, index) => stringify(row[index])) : row.map(stringify);
	}

	const fields = rowFields(row);

	return headers.map((header) => stringify(fields[header]));
};

const rowValue = <T>(row: DataTableRow<T>, index: number): T | number => {
	if (isDataObjectRow(row) && row.value !== undefined) {
		return row.value;
	}

	if (!Array.isArray(row) && 'value' in row && row.value !== undefined) {
		return row.value as T;
	}

	return index;
};

const rowLabel = <T>(headers: string[], row: DataTableRow<T>): string => rowCells(headers, row).join(' ');

const clampSelected = <T>(selected: number, rows: Array<VisibleRow<T>>): number => {
	if (rows.length === 0) {
		return 0;
	}

	return Math.min(selected, rows.length - 1);
};

const rowWindow = (total: number, selected: number, scroll?: number): { end: number; start: number } => {
	const size = parseOptionalScrollSize(scroll);

	if (size === undefined || size >= total) {
		return { end: total, start: 0 };
	}

	const before = Math.floor((size - 1) / 2);
	const start = Math.max(0, Math.min(selected - before, total - size));

	return { end: start + size, start };
};

const isPrintable = (key: string): boolean => {
	return [...key].every((character) => (character.codePointAt(0) ?? 0) >= 32);
};

export const datatable = async <T = unknown>(options: DataTablePromptOptions<T>): Promise<T | number> => {
	const headers = options.headers ?? derivedHeaders(options.rows);

	return promptUntilValid(options, async () => {
		const environment = promptEnvironment();

		let selected = 0;
		let mode: 'browse' | 'search' = 'browse';
		let query = '';

		const visibleRows = (): Array<VisibleRow<T>> => {
			return options.rows.map((row, index) => ({ index, row })).filter(({ row }) => options.filter?.(query, row) ?? rowLabel(headers, row).toLowerCase().includes(query.toLowerCase()));
		};

		const render = (): void => {
			const rows = visibleRows();

			selected = clampSelected(selected, rows);

			const window = rowWindow(rows.length, selected, options.scroll);

			const renderedRows = rows.slice(window.start, window.end).map(({ row }, offset) => {
				const index = window.start + offset;

				return [index === selected ? '›' : ' ', ...rowCells(headers, row)];
			});

			const querySuffix = mode === 'search' || query.length > 0 ? ` ${query}` : '';

			environment.output.write(`${options.message}${querySuffix}\n`);
			environment.output.write(`${renderTable(['', ...headers], renderedRows)}\n`);
		};

		if (!environment.input.readKey) {
			const rows = visibleRows();
			const selectedRow = rows[0];

			if (!selectedRow) {
				throw new PromptValidationError('Please select a valid row.');
			}

			return rowValue(selectedRow.row, selectedRow.index);
		}

		render();

		while (true) {
			const key = await environment.input.readKey();

			if (key === null) {
				throw new PromptValidationError('Please select a valid row.');
			}

			const rows = visibleRows();

			if (mode === 'search') {
				if (key === Key.enter) {
					mode = 'browse';
					selected = 0;
					render();
					continue;
				}

				if (key === Key.escape) {
					mode = 'browse';
					query = '';
					selected = 0;
					render();
					continue;
				}

				if (key === Key.backspace || key === Key.ctrlH) {
					query = query.slice(0, -1);
					selected = 0;
					render();
					continue;
				}

				if (isPrintable(key)) {
					query += key;
					selected = 0;
					render();
					continue;
				}
			}

			if (key === '/') {
				mode = 'search';
				query = '';
				selected = 0;
				render();
				continue;
			}

			if (key === Key.down || key === Key.downArrow || key === Key.ctrlN) {
				selected = rows.length === 0 ? 0 : (selected + 1) % rows.length;
				render();
				continue;
			}

			if (key === Key.up || key === Key.upArrow || key === Key.ctrlP) {
				selected = rows.length === 0 ? 0 : (selected - 1 + rows.length) % rows.length;
				render();
				continue;
			}

			if (key === Key.pageDown) {
				selected = rows.length === 0 ? 0 : Math.min(rows.length - 1, selected + parseScrollSize(options.scroll, 10));
				render();
				continue;
			}

			if (key === Key.pageUp) {
				selected = Math.max(0, selected - parseScrollSize(options.scroll, 10));
				render();
				continue;
			}

			if (oneOf([Key.home, Key.ctrlA], key)) {
				selected = 0;
				render();
				continue;
			}

			if (oneOf([Key.end, Key.ctrlE], key)) {
				selected = Math.max(0, rows.length - 1);
				render();
				continue;
			}

			if (key === Key.enter) {
				const selectedRow = rows[selected];

				if (!selectedRow) {
					throw new PromptValidationError('Please select a valid row.');
				}

				return rowValue(selectedRow.row, selectedRow.index);
			}
		}
	});
};
