import { fromCharacters } from '#tui/typed-value/characters';

type LineRange = {
	end: number;
	start: number;
};

const lineRanges = (value: string[]): LineRange[] => {
	const ranges: LineRange[] = [];

	let start = 0;

	for (const [index, character] of value.entries()) {
		if (character === '\n') {
			ranges.push({ end: index, start });
			start = index + 1;
		}
	}

	ranges.push({ end: value.length, start });

	return ranges;
};

const currentLine = (ranges: LineRange[], cursor: number): number => {
	const index = ranges.findIndex((range) => cursor <= range.end);

	return index === -1 ? ranges.length - 1 : index;
};

export const visibleLines = (value: string, cursor: number, rows: number | undefined): string => {
	if (rows === undefined || rows <= 0) {
		return value;
	}

	const valueCharacters = [...value];
	const ranges = lineRanges(valueCharacters);
	const line = currentLine(ranges, cursor);
	const start = Math.max(0, line - rows + 1);
	const end = start + rows;

	return ranges
		.slice(start, end)
		.map((range) => fromCharacters(valueCharacters.slice(range.start, range.end)))
		.join('\n');
};

export const moveLine = (value: string[], cursor: number, direction: 1 | -1): number => {
	const ranges = lineRanges(value);
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
