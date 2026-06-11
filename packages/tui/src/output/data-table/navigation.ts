import { parseScrollSize } from '#tui/concerns/validators/scroll';
import type { DataTableNavigationAction } from '#tui/output/data-table/keys';

export const nextDataTableSelection = (selected: number, total: number): number => {
	return total === 0 ? 0 : (selected + 1) % total;
};

export const previousDataTableSelection = (selected: number, total: number): number => {
	return total === 0 ? 0 : (selected - 1 + total) % total;
};

export const pageDataTableSelection = (selected: number, total: number, direction: 1 | -1, scroll?: number): number => {
	if (total === 0) {
		return 0;
	}

	return Math.max(0, Math.min(total - 1, selected + parseScrollSize(scroll, 10) * direction));
};

export const firstDataTableSelection = (): number => 0;

export const lastDataTableSelection = (total: number): number => Math.max(0, total - 1);

export const moveDataTableSelection = (action: DataTableNavigationAction, selected: number, total: number, scroll?: number): number => {
	if (action === 'next') {
		return nextDataTableSelection(selected, total);
	}

	if (action === 'previous') {
		return previousDataTableSelection(selected, total);
	}

	if (action === 'page-next') {
		return pageDataTableSelection(selected, total, 1, scroll);
	}

	if (action === 'page-previous') {
		return pageDataTableSelection(selected, total, -1, scroll);
	}

	if (action === 'first') {
		return firstDataTableSelection();
	}

	return lastDataTableSelection(total);
};
