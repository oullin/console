import { describe, expect, it } from 'vitest';
import { createMemoryOutput, withPromptEnvironment } from '#tui/environment';
import { ask, ensureRequired, promptUntilValid, PromptValidationError, validationMessage } from '#tui/prompt';

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

	it('accepts null, undefined, and empty string validator results', async () => {
		await expect(validationMessage('value', () => null)).resolves.toBeUndefined();

		await expect(validationMessage('value', () => undefined)).resolves.toBeUndefined();

		await expect(validationMessage('value', () => '')).resolves.toBeUndefined();
	});

	it('rejects invalid validator results', async () => {
		await expect(validationMessage('value', () => false as never)).rejects.toThrow('The validator must return a string or null.');
	});

	it('retries when a prompt reader throws a validation error', async () => {
		const output = createMemoryOutput();
		const attempts: number[] = [];

		const result = await withPromptEnvironment(
			{
				output,
				error: output,
				interactive: true,
			},
			() =>
				promptUntilValid({ message: 'Name' }, async (attempt) => {
					attempts.push(attempt);

					if (attempt === 0) {
						throw new PromptValidationError('Try again.');
					}

					return 'Ada';
				}),
		);

		expect(result).toBe('Ada');
		expect(attempts).toEqual([0, 1]);
		expect(output.text()).toContain('Try again.');
	});

	it('retries required validation failures in interactive mode', async () => {
		const output = createMemoryOutput();
		const values = ['', 'Ada'];

		const result = await withPromptEnvironment(
			{
				output,
				error: output,
				interactive: true,
			},
			() => promptUntilValid({ message: 'Name', required: true }, async () => values.shift() ?? ''),
		);

		expect(result).toBe('Ada');
		expect(output.text()).toContain('Required.');
	});

	it('rejects missing line input support', async () => {
		await withPromptEnvironment(
			{
				input: {},
				output: createMemoryOutput(),
				error: createMemoryOutput(),
				interactive: true,
			},
			async () => {
				await expect(ask('Name')).rejects.toThrow('The configured prompt input cannot read lines.');
			},
		);
	});
});
