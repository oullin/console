import { fromCharacters } from '#tui/typed-value/characters';
import { currentLine, lineRanges } from '#tui/typed-value/line-ranges';

export type VisibleLineWindow = {
	lines: string[];
	start: number;
	total: number;
};

export type VisibleTextWindow = VisibleLineWindow & {
	cursor: number;
	text: string;
};

export const visibleLines = (value: string, cursor: number, rows: number | undefined): string => {
	return visibleLineWindow(value, cursor, rows).lines.join('\n');
};

export const visibleTextWindow = (value: string, cursor: number, rows: number | undefined, width?: number): VisibleTextWindow => {
	const valueCharacters = [...value];
	const ranges = lineRanges(valueCharacters, width);
	const window = visibleLineWindow(value, cursor, rows, width);
	const visibleRanges = ranges.slice(window.start, window.start + window.lines.length);

	const currentRangeIndex = Math.max(
		0,
		visibleRanges.findIndex((range) => cursor <= range.end),
	);

	const currentRange = visibleRanges[currentRangeIndex] ?? visibleRanges.at(-1);
	const cursorInLine = currentRange === undefined ? 0 : Math.max(0, Math.min(cursor, currentRange.end) - currentRange.start);
	const previousWidth = window.lines.slice(0, currentRangeIndex).reduce((width, line) => width + [...line].length + 1, 0);

	return {
		...window,
		cursor: previousWidth + cursorInLine,
		text: window.lines.join('\n'),
	};
};

export const visibleLineWindow = (value: string, cursor: number, rows: number | undefined, width?: number): VisibleLineWindow => {
	const valueCharacters = [...value];
	const ranges = lineRanges(valueCharacters, width);

	if (rows === undefined || rows <= 0) {
		return {
			lines: ranges.map((range) => fromCharacters(valueCharacters.slice(range.start, range.end))),
			start: 0,
			total: ranges.length,
		};
	}

	const line = currentLine(ranges, cursor);
	const start = Math.max(0, line - rows + 1);
	const end = start + rows;

	return {
		lines: ranges.slice(start, end).map((range) => fromCharacters(valueCharacters.slice(range.start, range.end))),
		start,
		total: ranges.length,
	};
};

export const moveLine = (value: string[], cursor: number, direction: 1 | -1, width?: number): number => {
	const ranges = lineRanges(value, width);
	const index = currentLine(ranges, cursor);
	const range = ranges[index];

	if (!range) {
		return cursor;
	}

	const target = ranges[index + direction];

	if (!target) {
		return direction === -1 ? 0 : value.length;
	}

	const column = Math.min(cursor - range.start, range.end - range.start);
	const targetColumn = Math.min(column, target.end - target.start);

	return target.start + targetColumn;
};

export const moveToLineBoundary = (value: string[], cursor: number, boundary: 'start' | 'end'): number => {
	const ranges = lineRanges(value);
	const range = ranges[currentLine(ranges, cursor)];

	if (!range) {
		return cursor;
	}

	return boundary === 'start' ? range.start : range.end;
};
