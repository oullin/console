import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, PromptValidationError, text, withPromptEnvironment } from '#tui/index';

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

	it('accepts default values', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text('Name', '', 'Jess'),
		);

		expect(result).toBe('Jess');
	});

	it('transforms values before returning them', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([' ', 'J', 'e', 's', 's', ' ', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text({ message: 'Name', transform: (value) => value.trim() }),
		);

		expect(result).toBe('Jess');
	});

	it('retries after validation errors', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['J', 'e', 's', Key.enter, 's', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text({ message: 'Name', validate: (value) => (value !== 'Jess' ? 'Invalid name.' : '') }),
		);

		expect(result).toBe('Jess');
		expect(output.text()).toContain('Invalid name.');
	});

	it('edits values with backspace and delete keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['J', 'e', 'z', Key.backspace, 's', 's', Key.left, Key.delete, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text('Name'),
		);

		expect(result).toBe('Jes');
	});

	it('supports line navigation key bindings', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', 'r', 'c', 'h', 'e', 'r', Key.ctrlA, 'J', 'e', 's', 's', Key.ctrlE, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text('Name'),
		);

		expect(result).toBe('JessArcher');
	});

	it('returns empty strings and defaults in non-interactive mode', async () => {
		await expect(
			withPromptEnvironment(
				{
					output: createMemoryOutput(),
					error: createMemoryOutput(),
					interactive: false,
				},
				() => text('Name'),
			),
		).resolves.toBe('');

		await expect(
			withPromptEnvironment(
				{
					output: createMemoryOutput(),
					error: createMemoryOutput(),
					interactive: false,
				},
				() => text('Name', '', 'Jess'),
			),
		).resolves.toBe('Jess');
	});

	it('validates non-interactive default values', async () => {
		await expect(
			withPromptEnvironment(
				{
					output: createMemoryOutput(),
					error: createMemoryOutput(),
					interactive: false,
				},
				() => text({ message: 'Name', required: true }),
			),
		).rejects.toThrow(PromptValidationError);
	});

	it('handles failed empty key reads gracefully', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => text('Name'),
		);

		expect(result).toBe('');
	});
});
