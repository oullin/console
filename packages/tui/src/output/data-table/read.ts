import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { dataTableNavigationAction, startsDataTableSearch } from '#tui/output/data-table/keys';
import { moveDataTableSelection } from '#tui/output/data-table/navigation';
import { renderCancelledDataTableFrame, renderDataTableFrame } from '#tui/output/data-table/render';
import { dataTableRowValue, visibleDataTableRows } from '#tui/output/data-table/rows';
import { applyDataTableSearchKey, initialDataTableSearchState, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableSearchState } from '#tui/output/data-table/search';
import type { DataTableSelectionReadResult, VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTablePromptOptions } from '#tui/types';

const invalidRow = (): PromptValidationError => new PromptValidationError('Please select a valid row.');

const selectedDataTableValue = <T>(rows: Array<VisibleDataTableRow<T>>, selected: number): T | number => {
	const selectedRow = rows[selected];

	if (!selectedRow) {
		throw invalidRow();
	}

	return dataTableRowValue(selectedRow.row, selectedRow.index);
};

const initialDataTableSelection = <T>(rows: Array<VisibleDataTableRow<T>>, defaultValue: T | number | undefined): number => {
	if (defaultValue === undefined) {
		return 0;
	}

	const selected = rows.findIndex(({ index, row }) => Object.is(dataTableRowValue(row, index), defaultValue));

	return Math.max(0, selected);
};

const dataTableSelectionResult = <T>(rows: Array<VisibleDataTableRow<T>>, selected: number, submitted: boolean, cancelled = false): DataTableSelectionReadResult<T> => ({
	cancelled,
	rows,
	selected,
	submitted,
	value: selectedDataTableValue(rows, selected),
});

export const readDataTableSelection = async <T>(options: DataTablePromptOptions<T>, headers: string[]): Promise<DataTableSelectionReadResult<T>> => {
	const environment = promptEnvironment();

	let search: DataTableSearchState = initialDataTableSearchState();

	const visibleRows = () => visibleDataTableRows(options, headers, search.query.value);

	let selected = initialDataTableSelection(visibleRows(), options.default);

	const render = (): void => {
		selected = renderDataTableFrame({
			allRows: options.rows,
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
		return dataTableSelectionResult(visibleRows(), selected, false);
	}

	render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return dataTableSelectionResult(visibleRows(), selected, false);
		}

		const rows = visibleRows();

		if (key === Key.ctrlC) {
			renderCancelledDataTableFrame(options.message, headers, rows, selected);

			return {
				cancelled: true,
				rows,
				selected,
				submitted: false,
				value: await cancelPrompt(selectedDataTableValue(rows, selected)),
			};
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
			return dataTableSelectionResult(rows, selected, true);
		}
	}
};
