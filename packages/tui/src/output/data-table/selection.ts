import { parseOptionalScrollSize } from '#tui/concerns/validators/scroll';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';

export const clampDataTableSelection = <T>(selected: number, rows: Array<VisibleDataTableRow<T>>): number => {
	if (rows.length === 0) {
		return 0;
	}

	return Math.min(selected, rows.length - 1);
};

export const dataTableRowWindow = (total: number, selected: number, scroll?: number): { end: number; start: number } => {
	const size = parseOptionalScrollSize(scroll);

	if (size === undefined || size >= total) {
		return { end: total, start: 0 };
	}

	const before = Math.floor((size - 1) / 2);
	const start = Math.max(0, Math.min(selected - before, total - size));

	return { end: start + size, start };
};
