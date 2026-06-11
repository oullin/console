import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, datatable, form, Key, table, withPromptEnvironment } from '#tui/index';

describe('table output', () => {
	it('renders static table rows', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table(['Name', 'Runtime'], [['Ollin', 'OpenTUI']]);
		});

		expect(output.text()).toContain('| Name  | Runtime |');
		expect(output.text()).toContain('| Ollin | OpenTUI |');
	});

	it('renders object-form table options with inferred headers', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table({
				rows: [
					{ Name: 'Ollin', Runtime: 'OpenTUI' },
					{ Name: 'Prompts', Runtime: 'TypeScript' },
				],
			});
		});

		expect(output.text()).toContain('| Name    | Runtime    |');
		expect(output.text()).toContain('| Prompts | TypeScript |');
	});

	it('pads ANSI-styled table cells by visible width', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table(
				['Name', 'Runtime'],
				[
					['\u001B[31mRed\u001B[39m', 'Node'],
					['Blue', 'OpenTUI'],
				],
			);
		});

		expect(output.text()).toContain('\u001B[31mRed\u001B[39m  | Node');
		expect(output.text()).toContain('| Blue | OpenTUI |');
	});

	it('pads wide Unicode table cells by visible width', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table(
				['Name', 'Runtime'],
				[
					['東京', 'Node'],
					['Paris', 'OpenTUI'],
				],
			);
		});

		expect(output.text()).toContain('| 東京  | Node');
		expect(output.text()).toContain('| Paris | OpenTUI |');
	});

	it('renders missing table cells as empty columns', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table(['Name', 'Runtime'], [['Ollin'], ['Prompts', 'TypeScript']]);
		});

		expect(output.text()).toContain('| Ollin   |            |');
		expect(output.text()).toContain('| Prompts | TypeScript |');
	});

	it('renders object table rows in explicit header order', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table({
				headers: ['Runtime', 'Name', 'Notes'],
				rows: [
					{ Name: 'Ollin', Runtime: 'OpenTUI' },
					{ Name: 'Prompts', Runtime: 'TypeScript', Notes: 'Port' },
				],
			});
		});

		expect(output.text()).toContain('| Runtime    | Name    | Notes |');
		expect(output.text()).toContain('| OpenTUI    | Ollin   |       |');
		expect(output.text()).toContain('| TypeScript | Prompts | Port  |');
	});

	it('renders tables without headers from row-only input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			table([
				['Ollin', 'OpenTUI'],
				['Prompts', 'TypeScript'],
			]);
		});

		expect(output.text()).not.toContain('---');
		expect(output.text()).toContain('| Ollin   | OpenTUI    |');
		expect(output.text()).toContain('| Prompts | TypeScript |');
	});

	it('rejects invalid table runtime shapes through the validator layer', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(() => table(null as never)).toThrow();
			expect(() => table(['Name'], null as never)).not.toThrow();
			expect(() => table(['Name'], [null] as never)).toThrow();
		});
	});
});

describe('data table prompt', () => {
	it('returns the selected explicit row value', async () => {
		const output = createMemoryOutput();
		const selected = { id: 2 };

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					headers: ['Name', 'Runtime'],
					rows: [
						{ value: { id: 1 }, cells: { Name: 'Alpha', Runtime: 'Node' } },
						{ value: selected, cells: { Name: 'Beta', Runtime: 'OpenTUI' } },
					],
				}),
		);

		expect(result).toBe(selected);
		expect(output.text()).toContain('Pick project');
		expect(output.text()).toContain('›');
	});

	it('filters rows in explicit search mode', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'B', Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');
		expect(output.text()).toContain('Pick project B');
	});

	it('uses custom data table filters for search mode', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'slow', Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					filter: (query, row) => !Array.isArray(row) && row.Tag === query,
					rows: [
						{ Name: 'Alpha', Tag: 'fast', value: 'alpha' },
						{ Name: 'Beta', Tag: 'slow', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');
		expect(output.text()).toContain('Pick project slow');
	});

	it('does not filter rows from printable keys in browse mode', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['B', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('alpha');
	});

	it('cancels data table search with escape', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'B', Key.escape, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');

		const latestFrame = output.text().split('Pick project\n').at(-1) ?? '';

		expect(latestFrame).not.toContain('Pick project B');
		expect(latestFrame).toContain('Alpha');
		expect(latestFrame).toContain('Beta');
	});

	it('renders a no-results row for unmatched data table searches', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'Z', Key.escape, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					headers: ['Name'],
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('alpha');
		expect(output.text()).toContain('Pick project Z');
		expect(output.text()).toContain('No results found.');
	});

	it('cancels data table prompts with the current selected row', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');
		expect(output.text()).toContain('Cancelled.');
	});

	it('cancels data table search with the current filtered row', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'B', Key.ctrlC]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');
		expect(output.text()).toContain('Cancelled.');
	});

	it('edits Unicode data table search queries without corrupting input', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', '😀', Key.backspace, 'B', Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');
		expect(output.text()).toContain('Pick project B');
	});

	it('supports cursor edits inside data table search queries', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'B', 't', Key.left, 'e', Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick project',
					rows: [
						{ Name: 'Alpha', value: 'alpha' },
						{ Name: 'Beta', value: 'beta' },
					],
				}),
		);

		expect(result).toBe('beta');
		expect(output.text()).toContain('Pick project Bet');
	});

	it('falls back to row indexes when rows have no explicit value', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second']],
				}),
		);

		expect(result).toBe(1);
	});

	it('uses the first visible row without keyboard input support', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: {},
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [
						{ Name: 'First', value: 'first' },
						{ Name: 'Second', value: 'second' },
					],
				}),
		);

		expect(result).toBe('first');
	});

	it('renders a scrolling data table window around the selected row', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third'], ['Fourth']],
					scroll: 3,
				}),
		);

		const latestFrame = output.text().split('Pick row\n').at(-1) ?? '';

		expect(result).toBe(2);
		expect(latestFrame).not.toContain('First');
		expect(latestFrame).toContain('Second');
		expect(latestFrame).toContain('Third');
		expect(latestFrame).toContain('Fourth');
		expect(latestFrame).toContain('Viewing 2-4 of 4');
	});

	it('does not render data table viewing info when all rows are visible', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second']],
					scroll: 5,
				}),
		);

		expect(output.text()).not.toContain('Viewing');
	});

	it('renders data table viewing info for filtered result windows', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['/', 'a', Key.pageDown, Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['Alpha'], ['Atlas'], ['Beta'], ['Gamma'], ['Delta']],
					scroll: 2,
				}),
		);

		expect(output.text()).toContain('Viewing 3-4 of 5 results');
	});

	it('supports page, home, and end data table navigation keys', async () => {
		const output = createMemoryOutput();

		const pageDownResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.pageDown, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third'], ['Fourth']],
					scroll: 2,
				}),
		);

		const endHomeResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.end[0], Key.home[0], Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third'], ['Fourth']],
					scroll: 2,
				}),
		);

		expect(pageDownResult).toBe(2);
		expect(endHomeResult).toBe(0);
	});

	it('supports tab and reverse-tab data table navigation keys', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.tab, Key.tab, Key.shiftTab, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third']],
				}),
		);

		expect(result).toBe(1);
	});

	it('supports control-key data table navigation', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlN, Key.ctrlN, Key.ctrlP, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third']],
				}),
		);

		expect(result).toBe(1);
	});

	it('supports control-line data table navigation keys', async () => {
		const output = createMemoryOutput();

		const endResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlE, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third']],
				}),
		);

		const homeResult = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlE, Key.ctrlA, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third']],
				}),
		);

		expect(endResult).toBe(2);
		expect(homeResult).toBe(0);
	});

	it('wraps data table navigation from the first row to the last row', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.up, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third']],
				}),
		);

		expect(result).toBe(2);
	});

	it('normalizes fractional scroll sizes for data table page navigation', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.pageDown, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				datatable({
					message: 'Pick row',
					headers: ['Name'],
					rows: [['First'], ['Second'], ['Third'], ['Fourth']],
					scroll: 2.9,
				}),
		);

		const latestFrame = output.text().split('Pick row\n').at(-1) ?? '';

		expect(result).toBe(2);
		expect(latestFrame).not.toContain('First');
		expect(latestFrame).not.toContain('Second');
		expect(latestFrame).toContain('Third');
		expect(latestFrame).toContain('Fourth');
	});

	it('works from form builders', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.down, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.datatable(
						{
							message: 'Pick project',
							rows: [
								{ Name: 'Alpha', value: 'alpha' },
								{ Name: 'Beta', value: 'beta' },
							],
						},
						'project',
					)
					.submit(),
		);

		expect(responses.project).toBe('beta');
	});
});
