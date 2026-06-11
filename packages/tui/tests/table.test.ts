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
