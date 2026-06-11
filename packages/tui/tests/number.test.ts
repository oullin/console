import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, number, withPromptEnvironment } from '#tui/index';

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
		expect(output.text()).toContain('Please enter a valid number.');
	});

	it('rejects decimal values for integer prompts', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['1', '.', '5', Key.enter, '2', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => number({ message: 'Count', integer: true }),
		);

		expect(result).toBe(2);
		expect(output.text()).toContain('Please enter a valid number.');
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
