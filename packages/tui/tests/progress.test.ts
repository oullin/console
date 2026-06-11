import { describe, expect, it } from 'vitest';
import { createMemoryOutput, progress, withPromptEnvironment } from '#tui/index';

describe('progress helper', () => {
	it('maps iterable steps and returns callback results', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment({ output, error: output }, async () => {
			return progress('Uppercasing States', ['Alabama', 'Alaska'], (state) => String(state).toUpperCase());
		});

		expect(result).toEqual(['ALABAMA', 'ALASKA']);
		expect(output.text()).toContain('Uppercasing States');
		expect(output.text()).toContain('2 / 2');
	});

	it('supports manual progress updates with label and hint changes', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const bar = progress('Adding States', 2);

			bar.start();
			bar.label('ALABAMA').hint('alabama').advance();
			bar.label('ALASKA').hint('alaska').advance();
			bar.finish();
		});

		expect(output.text()).toContain('Adding States');
		expect(output.text()).toContain('ALABAMA');
		expect(output.text()).toContain('alaska');
	});

	it('renders visible progress for small non-zero percentages', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const bar = progress('Adding States', 100);

			bar.start();
			bar.advance();
		});

		expect(output.text()).toContain('█');
		expect(output.text()).toContain('1 / 100');
	});
});
