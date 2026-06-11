import { describe, expect, it } from 'vitest';
import { confirm, createMemoryOutput, createScriptedInput, Key, multiselect, PromptValidationError, select, withPromptEnvironment } from '#tui/index';

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

	it('confirms with uppercase direct y and n keys', async () => {
		const output = createMemoryOutput();

		const accepted = await withPromptEnvironment(
			{
				input: createScriptedInput(['Y', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => confirm('Continue?', false),
		);

		const declined = await withPromptEnvironment(
			{
				input: createScriptedInput(['N', Key.enter]),
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

	it('returns keys from keyed select options', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: { first: 'First', second: 'Second' } }),
		);

		expect(result).toBe('second');
	});

	it('returns numeric keys from numeric keyed select options', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select<number>({ message: 'Pick one', options: { 1: 'First', 2: 'Second' } }),
		);

		expect(result).toBe(2);
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
		expect(latestFrame).toContain('┃');
		expect(latestFrame).toContain('│');
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

	it('supports control-line select navigation keys', async () => {
		const output = createMemoryOutput();

		const endResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlE, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third'] }),
		);

		const homeResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlE, Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second', 'third'] }),
		);

		expect(endResult).toBe('third');
		expect(homeResult).toBe('first');
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

	it('trims line-mode select answers before matching choices', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: {
					async readLine(): Promise<string> {
						return ' 2 ';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second'] }),
		);

		expect(result).toBe('second');
	});

	it('rejects partial numeric line-mode select answers and retries', async () => {
		const output = createMemoryOutput();
		const answers = ['1abc', '2'];

		const result = await withPromptEnvironment(
			{
				input: {
					async readLine(): Promise<string> {
						return answers.shift() ?? '';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() => select({ message: 'Pick one', options: ['first', 'second'] }),
		);

		expect(result).toBe('second');
		expect(output.text()).toContain('Please select a valid option.');
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

	it('renders multiselect options as a checklist', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'] }),
		);

		expect(output.text()).toContain('\u001B[36m›\u001B[39m ◻ first');
		expect(output.text()).toContain('  \u001B[2m◻\u001B[22m \u001B[2msecond\u001B[22m');
		expect(output.text()).toContain('\u001B[36m› ◼\u001B[39m first');
	});

	it('returns keys from keyed multiselect options', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.space, Key.down, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: { first: 'First', second: 'Second', third: 'Third' } }),
		);

		expect(result).toEqual(['second', 'third']);
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

	it('returns an empty array for non-interactive multiselect prompts without defaults', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				output,
				error: output,
				interactive: false,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'] }),
		);

		expect(result).toEqual([]);
	});

	it('rejects invalid comma-separated line-mode multiselect answers and retries', async () => {
		const output = createMemoryOutput();
		const answers = ['1,missing', '1,2'];

		const result = await withPromptEnvironment(
			{
				input: {
					async readLine(): Promise<string> {
						return answers.shift() ?? '';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second'] }),
		);

		expect(result).toEqual(['first', 'second']);
		expect(output.text()).toContain('Please select valid options.');
	});

	it('rejects required non-interactive multiselect prompts without defaults', async () => {
		const output = createMemoryOutput();

		await expect(
			withPromptEnvironment(
				{
					output,
					error: output,
					interactive: false,
				},
				() => multiselect({ message: 'Pick many', options: ['first', 'second'], required: true }),
			),
		).rejects.toThrow(PromptValidationError);
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

	it('toggles only enabled multiselect choices with ctrl-a', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multiselect({
					message: 'Pick many',
					options: [
						{ label: 'first', value: 'first' },
						{ label: 'second', value: 'second', disabled: true },
						{ label: 'third', value: 'third' },
					],
				}),
		);

		expect(result).toEqual(['first', 'third']);
		expect(output.text()).toContain('Selected: first, third');
		expect(output.text()).not.toContain('Selected: first, second, third');
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
		expect(output.text()).toContain('┃');
		expect(output.text()).toContain('│');
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

	it('supports control-key multiselect navigation', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlN, Key.ctrlN, Key.ctrlP, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second', 'third'] }),
		);

		expect(result).toEqual(['second']);
	});

	it('ignores end-of-line control navigation for multiselect prompts', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlE, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multiselect({ message: 'Pick many', options: ['first', 'second', 'third'] }),
		);

		expect(result).toEqual(['first']);
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
