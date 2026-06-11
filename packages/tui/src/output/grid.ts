import { visibleWidth } from '#tui/strings';
import { terminalSize } from '#tui/terminal';

const padVisible = (value: string, width: number): string => `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;

const balancedColumnCount = (itemCount: number, maxColumns: number): number => {
	if (itemCount <= maxColumns) {
		return itemCount;
	}

	for (let columns = maxColumns; columns >= 1; columns -= 1) {
		const remainder = itemCount % columns;

		if (remainder === 0 || remainder >= Math.ceil(columns / 2)) {
			return columns;
		}
	}

	return maxColumns;
};

const chunkItems = (items: string[], columnCount: number): string[][] => {
	const rows: string[][] = [];

	for (let index = 0; index < items.length; index += columnCount) {
		const row = items.slice(index, index + columnCount);

		while (row.length < columnCount) {
			row.push('');
		}

		rows.push(row);
	}

	return rows;
};

const horizontal = (left: string, middle: string, right: string, widths: number[]): string => {
	return `${left}${widths.map((width) => '─'.repeat(width + 2)).join(middle)}${right}`;
};

export const renderGrid = (items: Array<string | number | boolean> = [], maxWidth?: number): string => {
	if (items.length === 0) {
		return '';
	}

	const values = items.map(String);
	const width = Math.max(1, Math.trunc(maxWidth ?? terminalSize().columns));
	const availableWidth = width - 2;
	const cellWidth = Math.max(...values.map(visibleWidth)) + 4;
	const maxColumns = Math.max(1, Math.floor((availableWidth - 1) / (cellWidth + 1)));
	const columnCount = Math.max(1, balancedColumnCount(values.length, maxColumns));
	const rows = chunkItems(values, columnCount);
	const widths = Array.from({ length: columnCount }, (_, column) => Math.max(...rows.map((row) => visibleWidth(row[column] ?? ''))));
	const renderedRows: string[] = [horizontal('┌', '┬', '┐', widths)];

	rows.forEach((row, index) => {
		if (index > 0) {
			renderedRows.push(horizontal('├', '┼', '┤', widths));
		}

		renderedRows.push(`│ ${widths.map((columnWidth, column) => padVisible(row[column] ?? '', columnWidth)).join(' │ ')} │`);
	});

	renderedRows.push(horizontal('└', '┴', '┘', widths));

	return renderedRows.map((line) => ` ${line}`).join('\n');
};
