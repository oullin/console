import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, multisearch, search, withPromptEnvironment } from '#tui/index';

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
		expect(output.text()).toContain('›');
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
});
