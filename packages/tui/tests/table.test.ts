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
