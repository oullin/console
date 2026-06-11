import { describe, expect, it } from 'vitest';
import { ensureRequired } from '#tui/prompt';

describe('prompt validation', () => {
	it('uses the default required message for empty values', () => {
		expect(ensureRequired('', true)).toBe('Required.');
		expect(ensureRequired([], true)).toBe('Required.');
		expect(ensureRequired(false, true)).toBe('Required.');
		expect(ensureRequired(null, true)).toBe('Required.');
	});

	it('uses custom required messages and treats empty strings as required configuration', () => {
		expect(ensureRequired('', 'Choose something.')).toBe('Choose something.');
		expect(ensureRequired('', '')).toBe('Required.');
	});

	it('ignores required validation when explicitly disabled', () => {
		expect(ensureRequired('', false)).toBeUndefined();
		expect(ensureRequired('', undefined)).toBeUndefined();
	});
});
