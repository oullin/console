import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, number, PromptValidationError, withPromptEnvironment } from '#tui/index';
import { parseNumberInput } from '#tui/prompts/number/validators/value';

describe('number prompt', () => {
	it('rejects partial decimal input and accepts a retry', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['1', '2', 'a', Key.enter, '4', '2', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Amount' }),
		);

		expect(result).toBe(42);
		expect(output.text()).toContain('Must be a number');
	});

	it('casts decimal numeric values to integers', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['1', '.', '5', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', integer: true }),
		);

		expect(result).toBe(1);
	});

	it('returns an empty string for optional empty input', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count' }),
		);

		expect(result).toBe('');
	});

	it('renders placeholders before number input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number('Count', '0'),
		);

		expect(output.text()).toContain('? Count 0');
	});

	it('renders typed number values while reading raw key input', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['4', '2', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count' }),
		);

		expect(result).toBe(42);
		expect(output.text()).toContain('? Count 4');
		expect(output.text()).toContain('? Count 42');
	});

	it('requires number input when configured', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter, '4', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', required: true }),
		);

		expect(result).toBe(4);
		expect(output.text()).toContain('Required.');
	});

	it('returns decimal input as an integer value', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['1', '.', '9', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count' }),
		);

		expect(result).toBe(1);
	});

	it('parses numeric values as integers', () => {
		expect(parseNumberInput('1.9')).toEqual({ value: 1 });
		expect(parseNumberInput('1.9', { integer: true })).toEqual({ value: 1 });
		expect(parseNumberInput('1', { integer: true })).toEqual({ value: 1 });
	});

	it('validates typed values against min and max bounds', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['1', Key.enter, '5', Key.enter, '3', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', min: 2, max: 4 }),
		);

		expect(result).toBe(3);
		expect(output.text()).toContain('Must be at least 2');
		expect(output.text()).toContain('Must be less than 4');
	});

	it('increments and decrements with arrow keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.up, Key.up, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', step: 2 }),
		);

		expect(result).toBe(1);
		expect(output.text()).toContain('? Count 1');
	});

	it('does not increment or decrement with control navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlP, Key.ctrlP, Key.ctrlN, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', step: 2 }),
		);

		expect(result).toBe('');
		expect(output.text()).not.toContain('? Count 1');
	});

	it('increments and decrements decimal values with whole steps', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.up, Key.down, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Amount', default: 1.5, step: 0.25 }),
		);

		expect(result).toBe(0);
		expect(output.text()).toContain('? Amount 2');
		expect(output.text()).toContain('? Amount 0');
	});

	it('falls back to a whole step for invalid step sizes', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.up, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Amount', default: 1.5, step: 0 }),
		);

		expect(result).toBe(2);
	});

	it('renders default number values before input', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', default: 7 }),
		);

		expect(result).toBe(7);
		expect(output.text()).toContain('? Count 7');
	});

	it('returns an empty string for non-interactive number prompts without defaults', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				output,
				error: output,
				interactive: false,
			},
			() => number({ message: 'Count' }),
		);

		expect(result).toBe('');
	});

	it('rejects required non-interactive number prompts without defaults', async () => {
		const output = createMemoryOutput();

		await expect(
			withPromptEnvironment(
				{
					output,
					error: output,
					interactive: false,
				},
				() => number({ message: 'Count', required: true }),
			),
		).rejects.toThrow(PromptValidationError);
	});

	it('clamps arrow key changes to min and max', async () => {
		const output = createMemoryOutput();

		const increased = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.up, Key.up, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', max: 3, min: 2, step: 2 }),
		);

		const decreased = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', max: 3, min: 2, step: 2 }),
		);

		expect(increased).toBe(3);
		expect(decreased).toBe(2);
	});
});
