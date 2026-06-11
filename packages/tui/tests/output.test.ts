import { describe, expect, it } from 'vitest';
import { alert, createMemoryOutput, error, grid, info, intro, note, outro, table, warning, withPromptEnvironment } from '#tui/index';

describe('output helpers', () => {
	it('returns success from note-style helpers', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(note('Hello')).toBe(true);
			expect(error('Nope')).toBe(true);
			expect(warning('Careful')).toBe(true);
			expect(alert('Heads up')).toBe(true);
			expect(info('Facts')).toBe(true);
			expect(intro('Start')).toBe(true);
			expect(outro('Done')).toBe(true);
		});

		expect(output.text()).toContain('Hello');
		expect(output.text()).toContain('Done');
	});

	it('returns success from table and grid helpers', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(table(['Name'], [['Ollin']])).toBe(true);
			expect(grid(['A', 'B'], 2)).toBe(true);
		});

		expect(output.text()).toContain('| Name');
		expect(output.text()).toContain('A  B');
	});

	it('keeps grid rendering finite for invalid widths', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(grid(['A', 'B'], 0)).toBe(true);
			expect(grid(['C', 'D'], -2)).toBe(true);
		});

		expect(output.text()).toContain('A\nB');
		expect(output.text()).toContain('C\nD');
	});

	it('normalizes fractional grid widths without overlapping rows', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			expect(grid(['A', 'B', 'C', 'D'], 2.5)).toBe(true);
		});

		expect(output.text()).toBe('A  B\nC  D\n');
	});
});
