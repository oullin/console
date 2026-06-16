import { eraseRenderedFrame } from '#tui/status/frame';
import { moveDataTableSelection } from '#tui/output/data-table/navigation';
import { initialDataTableSelection } from '#tui/output/data-table/reader/result';
import { renderDataTableFrame } from '#tui/output/data-table/render';
import { visibleDataTableRows } from '#tui/output/data-table/rows';
import { applyDataTableSearchKey, initialDataTableSearchState, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableNavigationAction } from '#tui/output/data-table/keys';
import type { DataTableSearchState } from '#tui/output/data-table/search';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTablePromptOptions } from '#tui/types';

export type DataTableReadOptions<T> = DataTablePromptOptions<T> & {
	hasDefault?: boolean;
};

export type DataTableReaderSession<T> = {
	applySearchKey(key: string): boolean;
	beginSearch(): void;
	frame(): string;
	moveSelection(action: DataTableNavigationAction): void;
	render(): void;
	rows(): Array<VisibleDataTableRow<T>>;
	selected(): number;
};

export const createDataTableReaderSession = <T>(options: DataTableReadOptions<T>, headers: string[]): DataTableReaderSession<T> => {
	let search: DataTableSearchState = initialDataTableSearchState();
	let selected = initialDataTableSelection(visibleRows(), options.default, options.hasDefault);
	let frame = '';

	function visibleRows(): Array<VisibleDataTableRow<T>> {
		return visibleDataTableRows(options, headers, search.query.value);
	}

	function render(): void {
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
	}

	function resetSearchSelection(nextSearch: DataTableSearchState): void {
		search = nextSearch;
		selected = 0;
		render();
	}

	return {
		applySearchKey(key) {
			const nextSearch = applyDataTableSearchKey(search, key);

			if (!nextSearch.changed) {
				return false;
			}

			resetSearchSelection(nextSearch.state);

			return true;
		},
		beginSearch() {
			resetSearchSelection(startDataTableSearch());
		},
		frame() {
			return frame;
		},
		moveSelection(action) {
			selected = moveDataTableSelection(action, selected, visibleRows().length, options.scroll);
			render();
		},
		render,
		rows: visibleRows,
		selected() {
			return selected;
		},
	};
};
