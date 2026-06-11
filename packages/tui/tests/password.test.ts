import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, password, withPromptEnvironment } from '#tui/index';

describe('password prompt', () => {
	it('returns typed values without rendering the raw password', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['s', 'e', 'c', 'r', 'e', 't', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => password('Password'),
		);

		expect(result).toBe('secret');
		expect(output.text()).not.toContain('secret');
		expect(output.text()).toContain('••••••');
	});

	it('renders password placeholders before input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => password('Password', 'Required'),
		);

		expect(output.text()).toContain('? Password Required');
	});
});
