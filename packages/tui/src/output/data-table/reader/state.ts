import { moveDataTableSelection } from '#tui/output/data-table/navigation';
import { initialDataTableSelection } from '#tui/output/data-table/reader/result';
import { visibleDataTableRows } from '#tui/output/data-table/rows';
import { applyDataTableSearchKey, initialDataTableSearchState, startDataTableSearch } from '#tui/output/data-table/search';
import type { DataTableNavigationAction } from '#tui/output/data-table/keys';
import type { DataTableSearchState } from '#tui/output/data-table/search';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';

export type DataTableReaderState<T> = {
	applySearchKey(key: string): boolean;
	beginSearch(): void;
	mode(): DataTableSearchState['mode'];
	moveSelection(action: DataTableNavigationAction): void;
	query(): string;
	rows(): Array<VisibleDataTableRow<T>>;
	selected(): number;
	setSelected(selected: number): void;
};

export const createDataTableReaderState = <T>(options: DataTableReadOptions<T>, headers: string[]): DataTableReaderState<T> => {
	let search = initialDataTableSearchState();
	let selected = initialDataTableSelection(visibleRows(), options.default, options.hasDefault);

	function visibleRows(): Array<VisibleDataTableRow<T>> {
		return visibleDataTableRows(options, headers, search.query.value);
	}

	function resetSearchSelection(nextSearch: DataTableSearchState): void {
		search = nextSearch;
		selected = 0;
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
		mode() {
			return search.mode;
		},
		moveSelection(action) {
			selected = moveDataTableSelection(action, selected, visibleRows().length, options.scroll);
		},
		query() {
			return search.query.value;
		},
		rows: visibleRows,
		selected() {
			return selected;
		},
		setSelected(nextSelected) {
			selected = nextSelected;
		},
	};
};
