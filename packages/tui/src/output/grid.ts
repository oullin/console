import { createGridLayout } from '#tui/output/grid/layout';
import { boxedGridLines } from '#tui/output/grid/lines';
import { terminalSize } from '#tui/terminal';

export const renderGrid = (items: Array<string | number | boolean> = [], maxWidth?: number): string => {
	if (items.length === 0) {
		return '';
	}

	const values = items.map(String);
	const requestedWidth = Math.trunc(maxWidth ?? terminalSize().columns);
	const width = Number.isFinite(requestedWidth) ? Math.max(1, requestedWidth) : 1;
	const availableWidth = width - 2;
	const layout = createGridLayout(values, availableWidth);

	return boxedGridLines(layout)
		.map((line) => ` ${line}`)
		.join('\n');
};
