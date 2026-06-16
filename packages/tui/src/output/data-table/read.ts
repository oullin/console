import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { dataTableNavigationAction, startsDataTableSearch } from '#tui/output/data-table/keys';
import { moveDataTableSelection } from '#tui/output/data-table/navigation';
import { readDataTableFallbackSelection } from '#tui/output/data-table/reader/fallback';
import { assertSelectedDataTableRow, dataTableSelectionResult, initialDataTableSelection, selectedDataTableValue } from '#tui/output/data-table/reader/result';
import { renderCancelledDataTableFrame, renderDataTableFrame } from '#tui/output/data-table/render';
import { visibleDataTableRows } from '#tui/output/data-table/rows';
import { applyDataTableSearchKey, initialDataTableSearchState, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableSearchState } from '#tui/output/data-table/search';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { DataTablePromptOptions } from '#tui/types';

type DataTableReadOptions<T> = DataTablePromptOptions<T> & {
	hasDefault?: boolean;
};

export const readDataTableSelection = async <T>(options: DataTableReadOptions<T>, headers: string[]): Promise<DataTableSelectionReadResult<T>> => {
	const environment = promptEnvironment();

	let search: DataTableSearchState = initialDataTableSearchState();

	const visibleRows = () => visibleDataTableRows(options, headers, search.query.value);

	let selected = initialDataTableSelection(visibleRows(), options.default, options.hasDefault);
	let frame = '';

	const render = (): void => {
		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		const rendered = renderDataTableFrame({
			allRows: options.rows,
			headers,
			message: options.message,
			mode: search.mode,
			query: search.query.value,
			rows: visibleRows(),
			scroll: options.scroll,
			selected,
		});

		frame = rendered.frame;
		selected = rendered.selected;
	};

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			return dataTableSelectionResult(visibleRows(), selected, false);
		}

		return readDataTableFallbackSelection(options, headers);
	}

	render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			const currentRows = visibleRows();

			assertSelectedDataTableRow(currentRows, selected, frame);

			return dataTableSelectionResult(currentRows, selected, false, false, frame);
		}

		const rows = visibleRows();

		if (key === Key.ctrlC) {
			assertSelectedDataTableRow(rows, selected, frame);
			eraseRenderedFrame(frame);
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
			assertSelectedDataTableRow(rows, selected, frame);

			return dataTableSelectionResult(rows, selected, true, false, frame);
		}
	}
};
