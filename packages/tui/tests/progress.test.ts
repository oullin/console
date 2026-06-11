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

	it('renders a fully filled progress bar at completion', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const bar = progress('Adding States', 2);

			bar.finish();
		});

		expect(output.text()).toContain('████████████████████ 2 / 2');
	});

	it('returns a completion value separately from the current count', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const bar = progress('Adding States', 2);

			bar.start();
			bar.advance();

			expect(bar.current()).toBe(1);
			expect(bar.value()).toBe(true);
		});
	});

	it('clamps manual progress updates to the valid range', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const bar = progress('Adding States', 2);

			bar.advance(3);
			expect(bar.current()).toBe(2);

			bar.advance(-5);
			expect(bar.current()).toBe(0);
		});

		expect(output.text()).toContain('2 / 2');
		expect(output.text()).toContain('0 / 2');
	});

	it('normalizes fractional totals and ignores non-finite advance values', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const bar = progress(2.9, 'Adding States');

			expect(bar.total).toBe(2);

			bar.advance(Number.NaN);

			expect(bar.current()).toBe(0);
		});

		expect(output.text()).toContain('0 / 2');
	});

	it('rejects invalid numeric progress step counts before rendering', () => {
		expect(() => progress('Adding States', -1)).toThrow('Progress bar must have at least one item.');
		expect(() => progress('Adding States', Number.POSITIVE_INFINITY)).toThrow('Progress bar must have at least one item.');
	});
});
