import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, PromptValidationError, textarea, withPromptEnvironment } from '#tui/index';

describe('textarea prompt', () => {
	it('accepts multiline input and submits with ctrl-d', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', Key.enter, 'B', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description'),
		);

		expect(result).toBe('A\nB');
		expect(output.text()).toContain('Description');
		expect(output.text()).toContain('┌ Description ');
		expect(output.text()).toContain('│ A');
		expect(output.text()).toContain('│ B');
	});

	it('renders textarea placeholders before input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description', 'Type here'),
		);

		expect(output.text()).toContain('┌ Description ');
		expect(output.text()).toContain('\u001B[2mType here\u001B[22m');
	});

	it('accepts default values', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description', '', 'Jess\nJoe'),
		);

		expect(result).toBe('Jess\nJoe');
	});

	it('transforms values before returning them', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([' ', 'J', 'e', 's', 's', ' ', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea({ message: 'Description', transform: (value) => value.trim() }),
		);

		expect(result).toBe('Jess');
	});

	it('retries after validation errors', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['J', 'e', 's', Key.ctrlD, 's', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea({ message: 'Description', validate: (value) => (value !== 'Jess' ? 'Invalid name.' : '') }),
		);

		expect(result).toBe('Jess');
		expect(output.text()).toContain('Invalid name.');
	});

	it('edits values with backspace and delete keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['J', 'e', 'z', Key.backspace, 's', 's', Key.left, Key.delete, Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description'),
		);

		expect(result).toBe('Jes');
	});

	it('keeps rendered textarea output within the configured row window', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['A', Key.enter, 'B', Key.enter, 'C', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description', '', '', false, undefined, '', 2),
		);

		const latestFrame = output.text().split('┌ Description ').at(-1) ?? '';

		expect(latestFrame).toContain('│ B');
		expect(latestFrame).toContain('│ C');
		expect(latestFrame).not.toContain('A\nB\nC');
		expect(latestFrame).toContain('\u001B[2m│\u001B[22m');
		expect(latestFrame).toContain('\u001B[36m┃\u001B[39m');
	});

	it('pads textarea frames to the configured rows', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['A', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description', '', '', false, undefined, 'Use full sentences.', 3),
		);

		const latestFrame = output.text().split('┌ Description ').at(-1) ?? '';

		expect(latestFrame).toContain('│ A');
		expect(latestFrame).toContain('│                                                              │');
		expect(output.text()).toContain('\u001B[2mUse full sentences.\u001B[22m');
	});

	it('wraps long textarea lines inside the frame', async () => {
		const output = createMemoryOutput();
		const longLine = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const firstWrappedLine = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567';

		await withPromptEnvironment(
			{
				input: createScriptedInput([longLine, Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description', '', '', false, undefined, '', 2),
		);

		const latestFrame = output.text().split('┌ Description ').at(-1) ?? '';

		expect(latestFrame).toContain(`│ ${firstWrappedLine}`);
		expect(latestFrame).toContain('│ 89');
		expect(latestFrame).not.toContain(`│ ${longLine}`);
	});

	it('moves the textarea cursor across wrapped rows before editing', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', Key.up, '!', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description', '', '', false, undefined, '', 2),
		);

		expect(result).toBe('ab!cdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
	});

	it('uses control navigation keys to move between textarea lines', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['e', 's', 's', Key.enter, 'o', 'e', Key.ctrlP, Key.left, Key.left, 'J', Key.ctrlN, Key.left, 'J', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description'),
		);

		expect(result).toBe('Jess\nJoe');
	});

	it('can move back to an empty textarea line', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['J', 'e', 's', 's', Key.enter, Key.up, Key.down, 'J', 'o', 'e', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description'),
		);

		expect(result).toBe('Jess\nJoe');
	});

	it('moves through ascending textarea line lengths', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['a', Key.enter, 'b', 'c', Key.enter, 'd', 'e', 'f', Key.up, Key.up, Key.down, 'g', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description'),
		);

		expect(result).toBe('a\nbgc\ndef');
	});

	it('moves through descending textarea line lengths', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['a', 'b', 'c', Key.enter, 'd', 'e', Key.enter, 'f', Key.up, Key.up, Key.right, Key.right, Key.down, 'g', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => textarea('Description'),
		);

		expect(result).toBe('abc\ndeg\nf');
	});

	it('returns empty strings and defaults in non-interactive mode', async () => {
		await expect(
			withPromptEnvironment(
				{
					output: createMemoryOutput(),
					error: createMemoryOutput(),
					interactive: false,
				},
				() => textarea('Description'),
			),
		).resolves.toBe('');

		await expect(
			withPromptEnvironment(
				{
					output: createMemoryOutput(),
					error: createMemoryOutput(),
					interactive: false,
				},
				() => textarea('Description', '', 'Jess'),
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
				() => textarea({ message: 'Description', required: true }),
			),
		).rejects.toThrow(PromptValidationError);
	});
});
