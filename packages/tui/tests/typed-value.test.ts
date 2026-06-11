import { describe, expect, it } from 'vitest';
import { applyTypedKey, Key } from '../src/index';

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

describe('typed value editing', () => {
	it('inserts buffered characters', () => {
		expect(apply(['Je', 'ss'])).toBe('Jess');
	});

	it('handles backspace and delete', () => {
		expect(apply(['J', 'e', 'z', Key.backspace, 's', 's'])).toBe('Jess');
		expect(apply(['J', 'e', 'z', Key.left, Key.delete, 's', 's'])).toBe('Jess');
	});

	it('supports emacs-style movement keys', () => {
		expect(apply(['J', 'z', 'e', Key.ctrlB, Key.ctrlH, Key.ctrlF, 's', 's'])).toBe('Jess');
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
});
