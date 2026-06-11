import { describe, expect, it } from 'vitest';
import { autocomplete, createMemoryOutput, createScriptedInput, Key, suggest, withPromptEnvironment } from '#tui/index';

const runSuggest = async (keys: string[], options: string[] | ((query: string) => string[])): Promise<{ output: string; result: string }> => {
	const output = createMemoryOutput();

	const result = await withPromptEnvironment(
		{
			input: createScriptedInput(keys),
			output,
			error: output,
			interactive: true,
		},
		() => suggest('Favorite color?', options),
	);

	return { output: output.text(), result };
};

const expectSuggestion = async (keys: string[], options: string[] | ((query: string) => string[]), result: string): Promise<void> => {
	await expect(runSuggest(keys, options)).resolves.toMatchObject({ result });
};

const outputFor = async (keys: string[], options: string[] | ((query: string) => string[])): Promise<string> => {
	const output = createMemoryOutput();

	await withPromptEnvironment(
		{
			input: createScriptedInput(keys),
			output,
			error: output,
			interactive: true,
		},
		() => suggest('Favorite color?', options),
	);

	return output.text();
};

describe('suggest prompt', () => {
	it('accepts arbitrary typed input', async () => {
		await expectSuggestion(['B', 'l', 'a', 'c', 'k', Key.enter], ['Red', 'Green', 'Blue'], 'Black');
	});

	it('completes input using tab', async () => {
		await expectSuggestion(['b', Key.tab, Key.enter], ['Red', 'Green', 'Blue'], 'Blue');
	});

	it('navigates matches using arrow and emacs keys', async () => {
		await expectSuggestion(['b', Key.down, Key.down, Key.down, Key.up, Key.enter], ['Red', 'Blue', 'Black', 'Blurple'], 'Black');

		await expectSuggestion(['b', Key.ctrlN, Key.ctrlN, Key.ctrlN, Key.ctrlP, Key.enter], ['Red', 'Blue', 'Black', 'Blurple'], 'Black');
	});

	it('navigates suggestions backwards with shift tab', async () => {
		await expectSuggestion(['b', Key.shiftTab, Key.enter], ['Red', 'Blue', 'Black', 'Blurple'], 'Blurple');
	});

	it('supports page suggestion navigation keys', async () => {
		await expectSuggestion(['b', Key.down, Key.pageDown, Key.pageUp, Key.pageDown, Key.enter], ['Red', 'Blue', 'Black', 'Blurple'], 'Blurple');
	});

	it('supports callback options', async () => {
		await expectSuggestion(['e', 'e', Key.down, Key.enter], (value) => ['Red', 'Green', 'Blue'].filter((option) => option.toLowerCase().includes(value.toLowerCase())), 'Green');
	});

	it('renders typed queries and suggestion matches', async () => {
		const output = await outputFor(['b', Key.down, Key.enter], ['Red', 'Green', 'Blue']);

		expect(output).toContain('Favorite color? b');
		expect(output).toContain('›');
		expect(output).toContain('Blue');
	});

	it('highlights suggestions on tab without replacing typed input', async () => {
		const output = await outputFor(['b', Key.tab, Key.enter], ['Red', 'Green', 'Blue']);

		expect(output).toContain('Favorite color? b');
		expect(output).not.toContain('Favorite color? Blue');
	});

	it('clears highlighted suggestions with horizontal navigation keys', async () => {
		await expectSuggestion(['b', Key.down, Key.left, Key.enter], ['Red', 'Green', 'Blue'], 'b');
	});

	it('renders suggest info for the highlighted result', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => suggest({ message: 'Favorite color?', options: ['Red', 'Green', 'Blue'], info: (value) => `About ${value ?? 'none'}` }),
		);

		expect(output.text()).toContain('About Blue');
	});
});

describe('autocomplete prompt', () => {
	it('renders autocomplete prompts with question formatting, hints, and placeholders', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Red', 'Green', 'Blue'], 'Type a color', '', false, undefined, 'Optional'),
		);

		expect(output.text()).toContain('? Favorite color? Optional Type a color');
	});

	it('renders autocomplete ghost text without a suggestion list', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Red', 'Green', 'Blue']),
		);

		expect(output.text()).toContain('Favorite color? blue');
		expect(output.text()).not.toContain('›');
	});

	it('accepts ghost completion with tab', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.tab, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Red', 'Green', 'Blue']),
		);

		expect(result).toBe('Blue');
		expect(output.text()).toContain('Favorite color? Blue');
	});

	it('accepts same-length autocomplete matches with right arrow', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', 'l', 'u', 'e', Key.right, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Blue']),
		);

		expect(result).toBe('Blue');
	});

	it('cycles autocomplete matches before accepting completion', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.down, Key.tab, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Blue', 'Black', 'Blurple']),
		);

		expect(result).toBe('Black');
	});

	it('cycles autocomplete matches with control navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.ctrlN, Key.ctrlN, Key.ctrlP, Key.tab, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Blue', 'Black', 'Blurple']),
		);

		expect(result).toBe('Black');
	});

	it('cycles autocomplete matches backwards with shift tab', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.shiftTab, Key.tab, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete('Favorite color?', ['Blue', 'Black', 'Blurple']),
		);

		expect(result).toBe('Blurple');
	});

	it('supports page autocomplete navigation before accepting completion', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.pageDown, Key.pageUp, Key.pageDown, Key.tab, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => autocomplete({ message: 'Favorite color?', options: ['Blue', 'Black', 'Blurple'], scroll: 2 }),
		);

		expect(result).toBe('Blurple');
		expect(output.text()).toContain('Favorite color? Blurple');
	});
});
