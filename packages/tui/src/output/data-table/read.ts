import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { PromptValidationError } from '#tui/prompt';
import { dataTableNavigationAction, startsDataTableSearch } from '#tui/output/data-table/keys';
import { moveDataTableSelection } from '#tui/output/data-table/navigation';
import { renderDataTableFrame } from '#tui/output/data-table/render';
import { dataTableRowValue, visibleDataTableRows } from '#tui/output/data-table/rows';
import { applyDataTableSearchKey, initialDataTableSearchState, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableSearchState } from '#tui/output/data-table/search';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTablePromptOptions } from '#tui/types';

const invalidRow = (): PromptValidationError => new PromptValidationError('Please select a valid row.');

const selectedDataTableValue = <T>(rows: Array<VisibleDataTableRow<T>>, selected: number): T | number => {
	const selectedRow = rows[selected];

	if (!selectedRow) {
		throw invalidRow();
	}

	return dataTableRowValue(selectedRow.row, selectedRow.index);
};

export const readDataTableSelection = async <T>(options: DataTablePromptOptions<T>, headers: string[]): Promise<T | number> => {
	const environment = promptEnvironment();

	let selected = 0;
	let search: DataTableSearchState = initialDataTableSearchState();

	const visibleRows = () => visibleDataTableRows(options, headers, search.query.value);

	const render = (): void => {
		selected = renderDataTableFrame({
			headers,
			message: options.message,
			mode: search.mode,
			query: search.query.value,
			rows: visibleRows(),
			scroll: options.scroll,
			selected,
		});
	};

	if (!environment.input.readKey) {
		return selectedDataTableValue(visibleRows(), selected);
	}

	render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			throw invalidRow();
		}

		const rows = visibleRows();

		if (key === Key.ctrlC) {
			environment.error.write('Cancelled.\n');

			return selectedDataTableValue(rows, selected);
		}

		const nextSearch = applyDataTableSearchKey(search, key);

		if (nextSearch.changed) {
			search = nextSearch.state;
			selected = 0;
			render();
			continue;
		}

		if (startsDataTableSearch(key)) {
			search = startDataTableSearch();
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
			return selectedDataTableValue(rows, selected);
		}
	}
};
