import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, textarea, withPromptEnvironment } from '#tui/index';

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
		expect(output.text()).toContain('? Description A\nB');
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

		expect(output.text()).toContain('? Description Type here');
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

		const latestFrame = output.text().split('? Description ').at(-1) ?? '';

		expect(latestFrame).toContain('B\nC');
		expect(latestFrame).not.toContain('A\nB\nC');
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
});
