import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { dataTableNavigationAction, startsDataTableSearch } from '#tui/output/data-table/keys';
import { moveDataTableSelection } from '#tui/output/data-table/navigation';
import { dataTableRowValue, deriveDataTableHeaders, visibleDataTableRows } from '#tui/output/data-table/rows';
import { renderDataTableFrame } from '#tui/output/data-table/render';
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
			selected = renderDataTableFrame({
				headers,
				message: options.message,
				mode,
				query: query.value,
				rows: visibleRows(),
				scroll: options.scroll,
				selected,
			});
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

			if (startsDataTableSearch(key)) {
				mode = 'search';
				query = { cursor: 0, value: '' };
				selected = 0;
				render();
				continue;
			}

			const action = dataTableNavigationAction(key);

			if (action !== null) {
				selected = moveDataTableSelection(action, selected, rows.length, options.scroll);
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
