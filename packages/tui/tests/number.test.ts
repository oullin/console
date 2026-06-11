import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, number, withPromptEnvironment } from '../src/index';

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
});
