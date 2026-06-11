import { describe, expect, it } from 'vitest';
import { confirm, createMemoryOutput, createScriptedInput, Key, multiselect, select, withPromptEnvironment } from '#tui/index';

describe('choice prompts', () => {
	it('confirms with direct y and n keys', async () => {
		const output = createMemoryOutput();

		const accepted = await withPromptEnvironment(
			{
				input: createScriptedInput(['y', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => confirm('Continue?', false),
		);

		const declined = await withPromptEnvironment(
			{
				input: createScriptedInput(['n', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => confirm('Continue?'),
		);

		expect(accepted).toBe(true);
		expect(declined).toBe(false);
	});

	it('toggles confirm values with navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.left, 'l', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => confirm('Continue?'),
		);

		expect(result).toBe(true);
		expect(output.text()).toContain('[Yes]');
		expect(output.text()).toContain('[No]');
	});

	it('treats false confirm answers as invalid when required', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['n', Key.enter, 'y', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => confirm('Continue?', true, 'Yes', 'No', true),
		);

		expect(result).toBe(true);
		expect(output.text()).toContain('Required.');
	});

	it('transforms confirm answers before returning', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['y', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => confirm('Continue?', true, 'Yes', 'No', false, undefined, '', (value) => !value),
		);

		expect(result).toBe(false);
	});

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

	it('starts select prompts on the default value', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third'], default: 'third' }),
		);

		expect(result).toBe('third');
		expect(output.text()).toContain('›    third');
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

	it('supports page select navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.pageDown, Key.pageUp, Key.pageDown, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third', 'fourth'], scroll: 2 }),
		);

		expect(result).toBe('third');
	});

	it('normalizes fractional scroll sizes for select page navigation', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.pageDown, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third', 'fourth'], scroll: 2.9 }),
		);

		const latestFrame = output.text().split('Pick one\n').at(-1) ?? '';

		expect(result).toBe('third');
		expect(latestFrame).not.toContain('first');
		expect(latestFrame).not.toContain('second');
		expect(latestFrame).toContain('third');
		expect(latestFrame).toContain('fourth');
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

	it('transforms selected values before validation and return', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				select({
					message: 'Pick one',
					options: ['first', 'second'],
					transform: (value) => value.toUpperCase(),
					validate: (value) => (value === 'FIRST' ? null : 'Unexpected value.'),
				}),
		);

		expect(result).toBe('FIRST');
	});

	it('cancels select prompts with the current highlighted option', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second'] }),
		);

		expect(result).toBe('second');
		expect(output.text()).toContain('Cancelled.');
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

	it('starts multiselect prompts with default selected values', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'], default: ['second'] }),
		);

		expect(result).toEqual(['second']);
		expect(output.text()).toContain('Selected: second');
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
		expect(output.text()).toContain('Required.');
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

	it('renders multiselect selected counts for scrollable option lists', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second', 'third'], scroll: 2 }),
		);

		expect(output.text()).toContain('0 selected');
		expect(output.text()).toContain('1 selected');
	});

	it('supports page multiselect navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.pageDown, Key.space, Key.pageUp, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second', 'third', 'fourth'], scroll: 2 }),
		);

		expect(result).toEqual(['third', 'first']);
	});

	it('combines multiselect info with selected counts', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second', 'third'], scroll: 2, info: (value) => `About ${value ?? 'none'}` }),
		);

		expect(output.text()).toContain('About first · 0 selected');
	});

	it('transforms multiselect values before validation and return', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.space, Key.down, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multiselect({
					message: 'Pick many',
					options: ['first', 'second'],
					transform: (value) => value.toReversed(),
					validate: (value) => (value[0] === 'second' ? null : 'Unexpected order.'),
				}),
		);

		expect(result).toEqual(['second', 'first']);
	});

	it('cancels multiselect prompts with the current marked options', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.space, Key.down, Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'] }),
		);

		expect(result).toEqual(['first']);
		expect(output.text()).toContain('Cancelled.');
	});
});
