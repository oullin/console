import { fromCharacters } from '#tui/typed-value/characters';
import { currentLine, lineRanges } from '#tui/typed-value/line-ranges';
import type { VisibleLineWindow } from '#tui/typed-value/lines/types';

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
