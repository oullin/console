import { terminalSize } from '#tui/terminal';
import { truncate, visibleWidth } from '#tui/strings';

type FitDataTableColumnsOptions = {
	allRows: string[][];
	headers: string[];
	maxWidth?: number;
	rows: string[][];
};

export const fitDataTableColumns = ({ allRows, headers, maxWidth = terminalSize().columns, rows }: FitDataTableColumnsOptions): { headers: string[]; rows: string[][] } => {
	const widths = dataTableColumnWidths(headers, allRows, maxWidth);

	return {
		headers: headers.map((header, index) => truncate(header, widths[index] ?? visibleWidth(header))),
		rows: rows.map((row) => row.map((cell, index) => truncateDataTableCell(cell, widths[index] ?? visibleWidth(cell)))),
	};
};

const truncateDataTableCell = (cell: string, width: number): string =>
	cell
		.split('\n')
		.map((line) => truncate(line, width))
		.join('\n');

const dataTableColumnWidths = (headers: string[], rows: string[][], maxWidth: number): number[] => {
	const columnCount = Math.max(headers.length, ...rows.map((row) => row.length));
	const headerWidths = Array.from({ length: columnCount }, (_, index) => visibleWidth(headers[index] ?? ''));
	const natural = headerWidths.map((headerWidth, index) => Math.max(headerWidth, naturalColumnWidth(rows, index)));
	const available = availableDataTableCellWidth(columnCount, maxWidth);
	const totalNatural = natural.reduce((sum, width) => sum + width, 0);

	if (available <= 0) {
		return Array.from({ length: columnCount }, () => 1);
	}

	if (totalNatural <= available) {
		return natural;
	}

	const shrunk = natural.map((width, index) => Math.max(headerWidths[index] ?? 0, Math.floor((available * width) / totalNatural)));

	let remaining = available - shrunk.reduce((sum, width) => sum + width, 0);

	for (const index of natural
		.map((width, index) => ({ index, width }))
		.sort((left, right) => right.width - left.width)
		.map(({ index }) => index)) {
		if (remaining <= 0) {
			break;
		}

		shrunk[index] += 1;
		remaining -= 1;
	}

	return shrunk;
};

const naturalColumnWidth = (rows: string[][], column: number): number => {
	const widths = rows
		.map((row) => row[column] ?? '')
		.flatMap((cell) => cell.split('\n').map(visibleWidth))
		.filter((width) => width > 0)
		.sort((left, right) => left - right);

	if (widths.length === 0) {
		return 0;
	}

	const percentile = widths[Math.max(0, Math.ceil(widths.length * 0.9) - 1)] ?? 0;
	const maximum = widths.at(-1) ?? 0;

	return maximum <= percentile * 2 ? maximum : percentile;
};

const availableDataTableCellWidth = (columnCount: number, maxWidth: number): number => {
	const markerWidth = 1;
	const renderedColumnCount = columnCount + 1;
	const tableOverhead = renderedColumnCount * 3 + 1;
	const scrollbarArea = 2;
	const frameInset = 6;

	return maxWidth - markerWidth - tableOverhead - scrollbarArea - frameInset;
};
