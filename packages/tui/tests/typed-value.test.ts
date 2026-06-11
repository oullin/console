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
});
