import { describe, expect, it } from 'vitest';
import { alert, createMemoryOutput, error, grid, info, intro, note, outro, table, warning, withPromptEnvironment } from '#tui/index';
import { renderGrid } from '#tui/output/grid';

describe('output helpers', () => {
	it('renders note-style helpers without returning a value', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(note('Hello')).toBeUndefined();
			expect(error('Nope')).toBeUndefined();
			expect(warning('Careful')).toBeUndefined();
			expect(alert('Heads up')).toBeUndefined();
			expect(info('Facts')).toBeUndefined();
			expect(intro('Start')).toBeUndefined();
			expect(outro('Done')).toBeUndefined();
		});

		expect(output.text()).toContain('Hello');
		expect(output.text()).toContain('Done');
	});

	it('renders table and boxed grid helpers without returning a value', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(table(['Name'], [['Ollin']])).toBeUndefined();
			expect(grid(['A', 'B'], 80)).toBeUndefined();
		});

		expect(output.text()).toContain('| Name');
		expect(output.text()).toContain('┌───┬───┐');
		expect(output.text()).toContain('│ A │ B │');
	});

	it('keeps grid rendering finite for invalid widths', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(grid(['A', 'B'], 0)).toBeUndefined();
			expect(grid(['C', 'D'], -2)).toBeUndefined();
		});

		expect(output.text()).toContain('│ A │');
		expect(output.text()).toContain('│ B │');
		expect(output.text()).toContain('│ C │');
		expect(output.text()).toContain('│ D │');
	});

	it('normalizes fractional grid widths without overlapping boxed rows', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(grid(['A', 'B', 'C', 'D'], 2.5)).toBeUndefined();
		});

		expect(output.text()).toBe(' ┌───┐\n │ A │\n ├───┤\n │ B │\n ├───┤\n │ C │\n ├───┤\n │ D │\n └───┘\n');
	});

	it('renders balanced grid rows with table separators', () => {
		expect(renderGrid(['component-alpha', 'api-client', 'theme-box', 'status-task', 'prompt-input', 'stream-log'], 50)).toBe(
			[
				' ┌─────────────────┬─────────────┐',
				' │ component-alpha │ api-client  │',
				' ├─────────────────┼─────────────┤',
				' │ theme-box       │ status-task │',
				' ├─────────────────┼─────────────┤',
				' │ prompt-input    │ stream-log  │',
				' └─────────────────┴─────────────┘',
			].join('\n'),
		);
	});

	it('does not render empty grids', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			grid([]);
		});

		expect(output.text()).toBe('');
	});
});
