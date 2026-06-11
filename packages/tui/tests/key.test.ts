import { describe, expect, it } from 'vitest';
import { Key, keyFromEvent } from '#tui/index';

describe('keyboard mapping', () => {
	it('maps named keys', () => {
		expect(keyFromEvent({ name: 'enter' })).toBe(Key.enter);
	});

	it('maps space and newline sequences', () => {
		expect(keyFromEvent({ sequence: ' ' })).toBe(Key.space);
		expect(keyFromEvent({ sequence: '\n' })).toBe(Key.enter);
	});
});
