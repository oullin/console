import { Key, oneOf } from '#tui/key';
import { characterLength, characters, fromCharacters, isPrintable } from '#tui/typed-value/characters';
import { deleteNextCharacter, deletePreviousCharacter, deletePreviousWord, deleteToLineStart } from '#tui/typed-value/delete';
import { moveLine, moveToLineBoundary } from '#tui/typed-value/lines';
import type { AppliedTypedKey, TypedValueState } from '#tui/typed-value/types';

export const applyTypedKey = (state: TypedValueState, key: string, allowNewLine = false): AppliedTypedKey => {
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

	if (allowNewLine && (key === Key.up || key === Key.upArrow)) {
		return { cursor: moveLine(value, cursor, -1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (allowNewLine && (key === Key.down || key === Key.downArrow)) {
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
		cursor = deleteNextCharacter(value, cursor);

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.ctrlU) {
		cursor = deleteToLineStart(value, cursor, allowNewLine);

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.backspace || key === Key.ctrlH) {
		cursor = deletePreviousCharacter(value, cursor);

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.optionBackspace) {
		cursor = deletePreviousWord(value, cursor);

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (isPrintable(key)) {
		for (const character of characters(key)) {
			value.splice(cursor, 0, character);
			cursor += 1;
		}
	}

	return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
};

export const initialTypedValueState = (value = ''): TypedValueState => {
	return {
		cursor: characterLength(value),
		value,
	};
};
