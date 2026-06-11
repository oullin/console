import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, text, withPromptEnvironment } from '#tui/index';

describe('text prompt', () => {
	it('renders typed values while reading raw key input', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', 'd', 'a', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text('Name'),
		);

		expect(result).toBe('Ada');
		expect(output.text()).toContain('? Name Ada');
	});

	it('renders placeholders before text input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text('Name', 'Jane Doe'),
		);

		expect(output.text()).toContain('? Name Jane Doe');
	});
});
