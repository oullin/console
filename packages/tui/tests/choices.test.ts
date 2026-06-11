import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, multiselect, select, withPromptEnvironment } from '#tui/index';

describe('choice prompts', () => {
	it('selects with arrow keys and enter', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second'] }),
		);

		expect(result).toBe('second');
		expect(output.text()).toContain('Pick one');
	});

	it('renders a scrolling select window around the highlighted choice', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third', 'fourth'], scroll: 3 }),
		);

		const latestFrame = output.text().split('Pick one\n').at(-1) ?? '';

		expect(result).toBe('third');
		expect(latestFrame).not.toContain('first');
		expect(latestFrame).toContain('second');
		expect(latestFrame).toContain('third');
		expect(latestFrame).toContain('fourth');
	});

	it('supports alternate select navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.tab, 'l', Key.right, 'h', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third'] }),
		);

		expect(result).toBe('third');
	});

	it('supports home and end select navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.end[0], Key.home[0], Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third'] }),
		);

		expect(result).toBe('first');
	});

	it('renders select info for the highlighted option', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second'], info: (value) => `About ${value ?? 'none'}` }),
		);

		expect(output.text()).toContain('About first');
		expect(output.text()).toContain('About second');
	});

	it('toggles multiselect choices with the space bar', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.space, Key.down, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'] }),
		);

		expect(result).toEqual(['first', 'second']);
		expect(output.text()).toContain('Selected: first');
		expect(output.text()).toContain('Selected: first, second');
	});

	it('requires multiselect choices when configured', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'], required: true }),
		);

		expect(result).toEqual(['first']);
		expect(output.text()).toContain('A value is required.');
	});

	it('toggles all multiselect choices with ctrl-a', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second', 'third'] }),
		);

		expect(result).toEqual(['first', 'second', 'third']);
		expect(output.text()).toContain('Selected: first, second, third');
	});

	it('renders multiselect info for the highlighted option', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'], info: (value) => `About ${value ?? 'none'}` }),
		);

		expect(output.text()).toContain('About first');
		expect(output.text()).toContain('About second');
	});
});
