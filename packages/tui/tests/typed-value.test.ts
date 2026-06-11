import { describe, expect, it } from 'vitest';
import { applyTypedKey, Key } from '#tui/index';

const apply = (keys: string[]): string => {
	let state = { cursor: 0, value: '' };

	for (const key of keys) {
		const next = applyTypedKey(state, key);

		state = { cursor: next.cursor, value: next.value };
	}

	return state.value;
};

const applyMultiline = (keys: string[]): { submitted: boolean; value: string } => {
	let state = { cursor: 0, value: '' };
	let submitted = false;

	for (const key of keys) {
		const next = applyTypedKey(state, key, true);

		state = { cursor: next.cursor, value: next.value };
		submitted = next.submitted;
	}

	return { submitted, value: state.value };
};

const applyMultilineState = (value: string, cursor: number, keys: string[]): { cursor: number; value: string } => {
	let state = { cursor, value };

	for (const key of keys) {
		const next = applyTypedKey(state, key, true);

		state = { cursor: next.cursor, value: next.value };
	}

	return state;
};

describe('typed value editing', () => {
	it('inserts buffered characters', () => {
		expect(apply(['Je', 'ss'])).toBe('Jess');
	});

	it('handles backspace and delete', () => {
		expect(apply(['J', 'e', 'z', Key.backspace, 's', 's'])).toBe('Jess');
		expect(apply(['J', 'e', 'z', Key.left, Key.delete, 's', 's'])).toBe('Jess');
	});

	it('deletes typed input back to the line start', () => {
		expect(apply(['J', 'a', 'n', 'e', Key.left, Key.left, Key.ctrlU, 'D', 'o'])).toBe('Done');
	});

	it('supports emacs-style movement keys', () => {
		expect(apply(['J', 'z', 'e', Key.ctrlB, Key.ctrlH, Key.ctrlF, 's', 's'])).toBe('Jess');
	});

	it('clamps UTF-16 cursor offsets to character positions before editing', () => {
		expect(applyMultilineState('😀', '😀'.length, ['!'])).toEqual({
			cursor: 2,
			value: '😀!',
		});
	});

	it('deletes the previous word after non-BMP characters', () => {
		expect(applyMultilineState('😀 hello', [...'😀 hello'].length, [Key.optionBackspace])).toEqual({
			cursor: 2,
			value: '😀 ',
		});
	});

	it('deletes the previous punctuation group as a word boundary', () => {
		expect(applyMultilineState('hello --', [...'hello --'].length, [Key.optionBackspace])).toEqual({
			cursor: 6,
			value: 'hello ',
		});
	});

	it('moves to the start and end of a line', () => {
		expect(apply(['A', 'r', Key.home[0], 'J', Key.end[0], 'c', 'h', 'e', 'r'])).toBe('JArcher');
	});

	it('submits multiline input with ctrl-d', () => {
		expect(applyMultiline(['A', Key.enter, 'B', Key.ctrlD])).toEqual({
			submitted: true,
			value: 'A\nB',
		});
	});

	it('moves the cursor between textarea lines', () => {
		expect(applyMultilineState('abc\nde\nfghi', 6, [Key.up])).toEqual({
			cursor: 2,
			value: 'abc\nde\nfghi',
		});

		expect(applyMultilineState('abc\nde\nfghi', 2, [Key.down])).toEqual({
			cursor: 6,
			value: 'abc\nde\nfghi',
		});

		expect(applyMultilineState('abc\nde\nfghi', 6, [Key.down])).toEqual({
			cursor: 9,
			value: 'abc\nde\nfghi',
		});
	});

	it('does not move between textarea lines with control navigation keys', () => {
		expect(applyMultilineState('abc\nde\nfghi', 6, [Key.ctrlP])).toEqual({
			cursor: 6,
			value: 'abc\nde\nfghi',
		});

		expect(applyMultilineState('abc\nde\nfghi', 2, [Key.ctrlN])).toEqual({
			cursor: 2,
			value: 'abc\nde\nfghi',
		});
	});

	it('moves to textarea line boundaries', () => {
		expect(applyMultilineState('abc\nde\nfghi', 5, [Key.home[0]])).toEqual({
			cursor: 4,
			value: 'abc\nde\nfghi',
		});

		expect(applyMultilineState('abc\nde\nfghi', 5, [Key.end[0]])).toEqual({
			cursor: 6,
			value: 'abc\nde\nfghi',
		});

		expect(applyMultilineState('abc\nde\nfghi', 9, [Key.ctrlA, 'X', Key.ctrlE, 'Y'])).toEqual({
			cursor: 13,
			value: 'abc\nde\nXfghiY',
		});
	});

	it('deletes textarea input back to the current line start', () => {
		expect(applyMultilineState('abc\nde\nfghi', 9, [Key.ctrlU])).toEqual({
			cursor: 7,
			value: 'abc\nde\nhi',
		});
	});
});
