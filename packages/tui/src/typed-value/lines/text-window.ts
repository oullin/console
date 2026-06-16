import { lineRanges } from '#tui/typed-value/line-ranges';
import { visibleLineWindow } from '#tui/typed-value/lines/window';
import type { VisibleTextWindow } from '#tui/typed-value/lines/types';

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
