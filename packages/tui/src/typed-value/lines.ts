import { fromCharacters } from '#tui/typed-value/characters';
import { visibleWidth } from '#tui/strings';

type LineRange = {
	end: number;
	start: number;
};

export type VisibleLineWindow = {
	lines: string[];
	start: number;
	total: number;
};

const lineRanges = (value: string[], width?: number): LineRange[] => {
	const ranges: LineRange[] = [];

	let start = 0;

	for (const [index, character] of value.entries()) {
		if (character === '\n') {
			ranges.push(...wrappedRanges(value, start, index, width));
			start = index + 1;
		}
	}

	ranges.push(...wrappedRanges(value, start, value.length, width));

	return ranges;
};

const wrappedRanges = (value: string[], start: number, end: number, width?: number): LineRange[] => {
	if (width === undefined || width <= 0 || start === end) {
		return [{ end, start }];
	}

	const ranges: LineRange[] = [];

	let rangeStart = start;
	let rangeWidth = 0;

	for (let index = start; index < end; index += 1) {
		const characterWidth = visibleWidth(value[index] ?? '');

		if (rangeWidth > 0 && rangeWidth + characterWidth > width) {
			ranges.push({ end: index, start: rangeStart });
			rangeStart = index;
			rangeWidth = 0;
		}

		rangeWidth += characterWidth;
	}

	ranges.push({ end, start: rangeStart });

	return ranges;
};

const currentLine = (ranges: LineRange[], cursor: number): number => {
	const index = ranges.findIndex((range) => cursor <= range.end);

	return index === -1 ? ranges.length - 1 : index;
};

export const visibleLines = (value: string, cursor: number, rows: number | undefined): string => {
	return visibleLineWindow(value, cursor, rows).lines.join('\n');
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
