import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { parseScrollSize } from '#tui/concerns/validators/scroll';
import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { renderTable } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';
import { dataTableRowCells, dataTableRowValue, deriveDataTableHeaders, visibleDataTableRows } from '#tui/output/data-table/rows';
import { clampDataTableSelection, dataTableRowWindow } from '#tui/output/data-table/selection';
import type { DataTablePromptOptions } from '#tui/types';

export const datatable = async <T = unknown>(options: DataTablePromptOptions<T>): Promise<T | number> => {
	const headers = options.headers ?? deriveDataTableHeaders(options.rows);

	return promptUntilValid(options, async () => {
		const environment = promptEnvironment();

		let selected = 0;
		let mode: 'browse' | 'search' = 'browse';
		let query = { cursor: 0, value: '' };

		const visibleRows = () => visibleDataTableRows(options, headers, query.value);

		const render = (): void => {
			const rows = visibleRows();

			selected = clampDataTableSelection(selected, rows);

			const window = dataTableRowWindow(rows.length, selected, options.scroll);

			const renderedRows = rows.slice(window.start, window.end).map(({ row }, offset) => {
				const index = window.start + offset;

				return [index === selected ? '›' : ' ', ...dataTableRowCells(headers, row)];
			});

			const querySuffix = mode === 'search' || query.value.length > 0 ? ` ${query.value}` : '';

			environment.output.write(`${options.message}${querySuffix}\n`);
			environment.output.write(`${renderTable(['', ...headers], renderedRows)}\n`);
		};

		if (!environment.input.readKey) {
			const rows = visibleRows();
			const selectedRow = rows[0];

			if (!selectedRow) {
				throw new PromptValidationError('Please select a valid row.');
			}

			return dataTableRowValue(selectedRow.row, selectedRow.index);
		}

		render();

		while (true) {
			const key = await environment.input.readKey();

			if (key === null) {
				throw new PromptValidationError('Please select a valid row.');
			}

			const rows = visibleRows();

			if (key === Key.ctrlC) {
				const selectedRow = rows[selected];

				environment.error.write('Cancelled.\n');

				if (!selectedRow) {
					throw new PromptValidationError('Please select a valid row.');
				}

				return dataTableRowValue(selectedRow.row, selectedRow.index);
			}

			if (mode === 'search') {
				if (key === Key.enter) {
					mode = 'browse';
					selected = 0;
					render();
					continue;
				}

				if (key === Key.escape) {
					mode = 'browse';
					query = { cursor: 0, value: '' };
					selected = 0;
					render();
					continue;
				}

				const next = applyTypedKey(query, key);

				if (next.value !== query.value || next.cursor !== query.cursor) {
					query = { cursor: next.cursor, value: next.value };
					selected = 0;
					render();
					continue;
				}
			}

			if (key === '/') {
				mode = 'search';
				query = { cursor: 0, value: '' };
				selected = 0;
				render();
				continue;
			}

			if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
				selected = rows.length === 0 ? 0 : (selected + 1) % rows.length;
				render();
				continue;
			}

			if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
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

				return dataTableRowValue(selectedRow.row, selectedRow.index);
			}
		}
	});
};
