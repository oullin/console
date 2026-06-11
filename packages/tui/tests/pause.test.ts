import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, pause, withPromptEnvironment } from '#tui/index';

describe('pause prompt', () => {
	it('waits for enter from key-driven input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['x', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => pause('Continue'),
		);

		expect(output.text()).toContain('Continue');
		expect(output.text().endsWith('\n')).toBe(true);
	});

	it('falls back to line input', async () => {
		const output = createMemoryOutput();

		let asked = '';

		await withPromptEnvironment(
			{
				input: {
					async readLine(message: string): Promise<string> {
						asked = message;

						return '';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() => pause('Continue'),
		);

		expect(asked).toContain('Continue');
	});
});
