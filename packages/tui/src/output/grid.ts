import { createGridLayout } from '#tui/output/grid/layout';
import { boxedGridLines } from '#tui/output/grid/lines';
import { terminalSize } from '#tui/terminal';

export const renderGrid = (items: Array<string | number | boolean> = [], maxWidth?: number): string => {
	if (items.length === 0) {
		return '';
	}

	const values = items.map(String);
	const width = Math.max(1, Math.trunc(maxWidth ?? terminalSize().columns));
	const availableWidth = width - 2;
	const layout = createGridLayout(values, availableWidth);

	return boxedGridLines(layout)
		.map((line) => ` ${line}`)
		.join('\n');
};
