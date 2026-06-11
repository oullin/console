import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';

export type TypedValueState = {
	cursor: number;
	value: string;
};

type TypedValueOptions = {
	allowNewLine?: boolean;
	default?: string;
	hint?: string;
	placeholder?: string;
	rows?: number;
};

const characters = (value: string): string[] => [...value];
const fromCharacters = (value: string[]): string => value.join('');
const characterLength = (value: string): number => characters(value).length;
const stringIndexToCharacterIndex = (value: string, index: number): number => characterLength(value.slice(0, index));

type LineRange = {
	end: number;
	start: number;
};

const isPrintable = (key: string): boolean => {
	return [...key].every((character) => {
		const code = character.codePointAt(0) ?? 0;

		return code >= 32 && code !== 127;
	});
};

const visibleLines = (value: string, cursor: number, rows: number | undefined): string => {
	if (rows === undefined || rows <= 0) {
		return value;
	}

	const valueCharacters = characters(value);
	const ranges = lineRanges(valueCharacters);
	const line = currentLine(ranges, cursor);
	const start = Math.max(0, line - rows + 1);
	const end = start + rows;

	return ranges
		.slice(start, end)
		.map((range) => fromCharacters(valueCharacters.slice(range.start, range.end)))
		.join('\n');
};

const renderTypedValue = (message: string, state: TypedValueState, options: TypedValueOptions): void => {
	const displayValue = state.value.length > 0 ? visibleLines(state.value, state.cursor, options.rows) : (options.placeholder ?? '');

	promptEnvironment().output.write(`${renderQuestion(message, options.hint)}${displayValue}\n`);
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

const moveLine = (value: string[], cursor: number, direction: 1 | -1): number => {
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

const moveToLineBoundary = (value: string[], cursor: number, boundary: 'start' | 'end'): number => {
	const ranges = lineRanges(value);
	const range = ranges[currentLine(ranges, cursor)];

	if (!range) {
		return cursor;
	}

	return boundary === 'start' ? range.start : range.end;
};

export const applyTypedKey = (state: TypedValueState, key: string, allowNewLine = false): TypedValueState & { submitted: boolean; cancelled: boolean } => {
	const value = characters(state.value);

	let cursor = Math.max(0, Math.min(value.length, state.cursor));

	if (key === Key.ctrlC) {
		return { cursor, value: fromCharacters(value), submitted: false, cancelled: true };
	}

	if (key === Key.ctrlD && allowNewLine) {
		return { cursor, value: fromCharacters(value), submitted: true, cancelled: false };
	}

	if (key === Key.enter) {
		if (!allowNewLine) {
			return { cursor, value: fromCharacters(value), submitted: true, cancelled: false };
		}

		value.splice(cursor, 0, '\n');
		cursor += 1;

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.left || key === Key.leftArrow || key === Key.ctrlB) {
		return { cursor: Math.max(0, cursor - 1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.right || key === Key.rightArrow || key === Key.ctrlF) {
		return { cursor: Math.min(value.length, cursor + 1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (allowNewLine && (key === Key.up || key === Key.upArrow || key === Key.ctrlP)) {
		return { cursor: moveLine(value, cursor, -1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (allowNewLine && (key === Key.down || key === Key.downArrow || key === Key.ctrlN)) {
		return { cursor: moveLine(value, cursor, 1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (oneOf([Key.home, Key.ctrlA], key)) {
		const nextCursor = allowNewLine ? moveToLineBoundary(value, cursor, 'start') : 0;

		return { cursor: nextCursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (oneOf([Key.end, Key.ctrlE], key)) {
		const nextCursor = allowNewLine ? moveToLineBoundary(value, cursor, 'end') : value.length;

		return { cursor: nextCursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.delete) {
		value.splice(cursor, 1);

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.ctrlU) {
		const start = allowNewLine ? moveToLineBoundary(value, cursor, 'start') : 0;

		value.splice(start, cursor - start);

		return { cursor: start, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.backspace || key === Key.ctrlH) {
		if (cursor === 0) {
			return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
		}

		value.splice(cursor - 1, 1);

		return { cursor: cursor - 1, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.optionBackspace) {
		const before = fromCharacters(value.slice(0, cursor));
		const match = before.match(/(?:[\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}\s]+)\s*$/u);
		const start = match?.index === undefined ? 0 : stringIndexToCharacterIndex(before, match.index);

		value.splice(start, cursor - start);

		return { cursor: start, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (isPrintable(key)) {
		for (const character of characters(key)) {
			value.splice(cursor, 0, character);
			cursor += 1;
		}
	}

	return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
};

export const readTypedValue = async (message: string, options: TypedValueOptions = {}): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return answer === '' && options.default !== undefined ? options.default : answer;
	}

	let state: TypedValueState = {
		cursor: characterLength(options.default ?? ''),
		value: options.default ?? '',
	};

	renderTypedValue(message, state, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		const next = applyTypedKey(state, key, options.allowNewLine);

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return state.value;
		}

		state = {
			cursor: next.cursor,
			value: next.value,
		};

		if (next.submitted) {
			environment.output.write('\n');

			return state.value;
		}

		renderTypedValue(message, state, options);
	}
};
