import { renderDataTableReaderSessionFrame } from '#tui/output/data-table/reader/session/render';
import { createDataTableReaderState } from '#tui/output/data-table/reader/state';
import type { DataTableNavigationAction } from '#tui/output/data-table/keys';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';

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
	const state = createDataTableReaderState(options, headers);

	let frame = '';

	function render(): void {
		frame = renderDataTableReaderSessionFrame(options, headers, state, frame);
	}

	return {
		applySearchKey(key) {
			if (!state.applySearchKey(key)) {
				return false;
			}

			render();

			return true;
		},
		beginSearch() {
			state.beginSearch();
			render();
		},
		frame() {
			return frame;
		},
		moveSelection(action) {
			state.moveSelection(action);
			render();
		},
		render,
		rows: state.rows,
		selected() {
			return state.selected();
		},
	};
};
