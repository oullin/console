import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, multisearch, parseAnsiText, PromptValidationError, search, withPromptEnvironment } from '#tui/index';
import type { SearchPromptOptions } from '#tui/index';

const colors = (value: string): Record<string, string> => {
	const options = {
		red: 'Red',
		green: 'Green',
		blue: 'Blue',
	};

	return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
};

describe('search prompt', () => {
	it('returns keys from associative options', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['u', 'e', Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(result).toBe('blue');
		expect(output.text()).toContain('Favorite color? ue');
	});

	it('validates selected values and allows another selection', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Favorite color?',
					options: () => ({ red: 'Red', green: 'Green', blue: 'Blue' }),
					validate: (value) => (value === 'red' ? 'Please choose green.' : null),
				}),
		);

		expect(result).toBe('green');
		expect(output.text()).toContain('Please choose green.');
	});

	it('renders the typed query while navigating results', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['r', Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(output.text()).toContain('Favorite color? r');
		expect(output.text()).toContain('\u001B[36m›\u001B[39m Red');
		expect(output.text()).toContain('\u001B[2mGreen\u001B[22m');
	});

	it('does not render an active search row before navigation highlights a result', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors, default: 'red' }),
		);

		const firstFrame = output.text().split('Favorite color?\n')[1] ?? '';

		expect(firstFrame).not.toContain('›');
		expect(firstFrame).toContain('\u001B[2mRed\u001B[22m');
	});

	it('respects scroll windows when rendering results', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.down, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Pick number',
					options: ['one', 'two', 'three', 'four'],
					scroll: 3,
				}),
		);

		const latestFrame = output.text().split('Pick number\n').at(-1) ?? '';

		expect(result).toBe('three');
		expect(latestFrame).not.toContain('one');
		expect(latestFrame).toContain('two');
		expect(latestFrame).toContain('three');
		expect(latestFrame).toContain('four');
		expect(latestFrame).toContain('┃');
		expect(latestFrame).toContain('│');
	});

	it('supports page search navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.pageDown, Key.pageUp, Key.pageDown, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Pick number',
					options: ['one', 'two', 'three', 'four'],
					scroll: 2,
				}),
		);

		expect(result).toBe('three');
	});

	it('supports control-key search navigation', async () => {
		const output = createMemoryOutput();

		const forwardResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlN, Key.ctrlN, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		const backwardResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlP, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(forwardResult).toBe('green');
		expect(backwardResult).toBe('blue');
	});

	it('renders search info for the highlighted result', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors, info: (value) => `About ${value ?? 'none'}` }),
		);

		expect(output.text()).toContain('About red');
	});

	it('renders an empty result message for unmatched search queries', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['z', Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors, default: 'red' }),
		);

		expect(parseAnsiText(output.text())).toContain('No results.');
		expect(output.text()).toContain('\u001B[2m  No results.\u001B[22m');
	});

	it('skips disabled search results while navigating', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Favorite color?',
					options: [
						{ label: 'Red', value: 'red', disabled: true },
						{ label: 'Green', value: 'green' },
					],
				}),
		);

		expect(result).toBe('green');
	});

	it('keeps search highlights empty when submitting without a highlighted result', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(result).toBe('red');
	});

	it('clears search highlights with horizontal navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.left, Key.enter, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(result).toBe('red');
	});

	it('cancels search prompts with the current highlighted result', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(result).toBe('red');
		expect(output.text()).toContain('Cancelled.');
	});

	it('uses the default when cancelling a disabled highlighted search result', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Favorite color?',
					options: [
						{ label: 'Red', value: 'red', disabled: true },
						{ label: 'Green', value: 'green' },
					],
					default: 'green',
				}),
		);

		expect(result).toBe('green');
		expect(output.text()).toContain('Cancelled.');
	});

	it('rejects optional single search prompts', async () => {
		const options = {
			message: 'Favorite color?',
			options: colors,
			required: false,
		} as unknown as SearchPromptOptions<string>;

		await expect(search(options)).rejects.toThrow('Argument [required] must be true or a string.');
	});

	it('transforms search values before validation and return', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Favorite color?',
					options: colors,
					transform: (value) => value.toUpperCase(),
					validate: (value) => (value === 'RED' ? null : 'Unexpected value.'),
				}),
		);

		expect(result).toBe('RED');
	});

	it('returns search defaults for empty line-mode answers', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: {
					async readLine(): Promise<string> {
						return '';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() =>
				search({
					message: 'Favorite color?',
					options: colors,
					default: 'green',
				}),
		);

		expect(result).toBe('green');
	});

	it('trims line-mode search answers before matching choices', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: {
					async readLine(): Promise<string> {
						return ' Green ';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() => search({ message: 'Favorite color?', options: colors }),
		);

		expect(result).toBe('green');
	});

	it('rejects disabled exact line-mode matches and retries', async () => {
		const output = createMemoryOutput();
		const answers = ['Red', 'Green'];

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
			() =>
				search({
					message: 'Favorite color?',
					options: [
						{ label: 'Red', value: 'red', disabled: true },
						{ label: 'Green', value: 'green' },
					],
				}),
		);

		expect(result).toBe('green');
		expect(output.text()).toContain('Please select a valid option.');
	});
});

describe('multisearch prompt', () => {
	it('toggles highlighted search results', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['V', Key.down, Key.space, Key.backspace, 'G', 'r', Key.down, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: (value) => {
						const options = { green: 'Green', violet: 'Violet' };

						return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
					},
				}),
		);

		expect(result).toEqual(['violet', 'green']);
		expect(output.text()).toContain('\u001B[36m› ◼\u001B[39m Violet');
		expect(output.text()).toContain('Selected: Violet');
		expect(output.text()).toContain('Selected: Violet, Green');
	});

	it('starts multisearch prompts with default selected values', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: colors,
					default: ['green'],
				}),
		);

		expect(result).toEqual(['green']);
		expect(output.text()).toContain('1 selected');
		expect(output.text()).toContain('Selected: Green');
	});

	it('returns selected defaults when multisearch input is exhausted', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: colors,
					default: ['green'],
				}),
		);

		expect(result).toEqual(['green']);
		expect(output.text()).toContain('Selected: Green');
	});

	it('returns an empty array for non-interactive multisearch prompts without defaults', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				output,
				error: output,
				interactive: false,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual([]);
	});

	it('rejects disabled line-mode multisearch choices and retries', async () => {
		const output = createMemoryOutput();
		const answers = ['Red', 'Green'];

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
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: [
						{ label: 'Red', value: 'red', disabled: true },
						{ label: 'Green', value: 'green' },
					],
				}),
		);

		expect(result).toEqual(['green']);
		expect(output.text()).toContain('Please select valid options.');
	});

	it('rejects required non-interactive multisearch prompts without defaults', async () => {
		const output = createMemoryOutput();

		await expect(
			withPromptEnvironment(
				{
					output,
					error: output,
					interactive: false,
				},
				() => multisearch({ message: 'Favorite colors?', options: colors, required: true }),
			),
		).rejects.toThrow(PromptValidationError);
	});

	it('renders multisearch info for the highlighted result', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors, info: (value) => `About ${value ?? 'none'}` }),
		);

		expect(output.text()).toContain('About red');
		expect(output.text()).toContain('0 selected');
	});

	it('renders an empty result message for unmatched multisearch queries', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['z', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(parseAnsiText(output.text())).toContain('No results.');
		expect(output.text()).toContain('\u001B[2m  No results.\u001B[22m');
	});

	it('renders hidden selected counts when multisearch results are filtered', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.space, 'B', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(output.text()).toContain('1 selected (1 hidden)');
	});

	it('keeps default multisearch labels while filtered out', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['B', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: colors,
					default: ['green'],
				}),
		);

		expect(result).toEqual(['green']);
		expect(output.text()).toContain('1 selected (1 hidden)');
		expect(output.text()).toContain('Selected: Green');
	});

	it('cancels multisearch prompts with the current selected values', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.space, 'B', Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual(['red']);
		expect(output.text()).toContain('Cancelled.');
	});

	it('toggles all current multisearch results with ctrl-a', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual(['red', 'green', 'blue']);
		expect(output.text()).toContain('Selected: Red, Green, Blue');
	});

	it('does not navigate multisearch results with ctrl-n or ctrl-p', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlN, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual([]);
		expect(output.text()).not.toContain('Selected: Green');
	});

	it('supports tab and reverse-tab multisearch navigation', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.tab, Key.tab, Key.shiftTab, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual(['red']);
	});

	it('keeps selected multisearch values visible after clearing the query', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['V', Key.down, Key.space, Key.backspace, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: (value) => {
						if (value === '') {
							return { green: 'Green' };
						}

						return { violet: 'Violet' };
					},
				}),
		);

		const latestFrame = output.text().split('Favorite colors?\n').at(-1) ?? '';

		expect(result).toEqual(['violet']);
		expect(latestFrame).toContain('Violet');
		expect(latestFrame).toContain('Green');
	});

	it('supports home and end multisearch navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.end[0], Key.space, Key.home[0], Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual(['blue', 'red']);
		expect(output.text()).toContain('Selected: Blue, Red');
	});

	it('ignores end-of-line control navigation while multisearch results are highlighted', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlE, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual(['red']);
		expect(output.text()).toContain('Selected: Red');
	});

	it('supports page multisearch navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.pageDown, Key.space, Key.pageUp, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors, scroll: 2 }),
		);

		expect(result).toEqual(['blue', 'red']);
		expect(output.text()).toContain('Selected: Blue, Red');
		expect(output.text()).toContain('┃');
		expect(output.text()).toContain('│');
	});

	it('skips disabled multisearch results while navigating and toggling all', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: [
						{ label: 'Red', value: 'red', disabled: true },
						{ label: 'Green', value: 'green' },
						{ label: 'Blue', value: 'blue' },
					],
				}),
		);

		expect(result).toEqual(['green', 'blue']);
		expect(output.text()).toContain('Selected: Green, Blue');
	});

	it('transforms multisearch values before validation and return', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				multisearch({
					message: 'Favorite colors?',
					options: colors,
					transform: (value) => value.toReversed(),
					validate: (value) => (value[0] === 'blue' ? null : 'Unexpected order.'),
				}),
		);

		expect(result).toEqual(['blue', 'green', 'red']);
	});

	it('trims line-mode multisearch answers before matching choices', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: {
					async readLine(): Promise<string> {
						return ' Green ';
					},
				},
				output,
				error: output,
				interactive: true,
			},
			() => multisearch({ message: 'Favorite colors?', options: colors }),
		);

		expect(result).toEqual(['green']);
	});
});
