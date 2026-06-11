import { describe, expect, it } from 'vitest';
import { createMemoryOutput, spin, withPromptEnvironment } from '#tui/index';
import { renderSpinnerFrame, spinnerFrame } from '#tui/status/spinner/render';

describe('spinner helper', () => {
	it('runs callback-first spinner callbacks', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment({ output, error: output }, async () => {
			return spin(async () => 'done', { message: 'Working' });
		});

		expect(result).toBe('done');
		expect(output.text()).toContain(' ⠶ Working');
		expect(output.text()).not.toContain('Done: Working');
	});

	it('runs label-first spinner callbacks', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment({ output, error: output }, async () => {
			return spin('Working', async () => 'done');
		});

		expect(result).toBe('done');
		expect(output.text()).toContain(' ⠶ Working');
		expect(output.text()).not.toContain('Done: Working');
	});

	it('rethrows spinner errors without synthetic failure output', async () => {
		const output = createMemoryOutput();
		const failure = new Error('failed');

		await expect(
			withPromptEnvironment({ output, error: output }, async () => {
				await spin('Working', async () => {
					throw failure;
				});
			}),
		).rejects.toBe(failure);

		expect(output.text()).toContain(' ⠶ Working');
		expect(output.text()).not.toContain('Failed: Working');
		expect(output.text()).not.toContain('Done: Working');
	});

	it('renders deterministic animated spinner frames', () => {
		expect(Array.from({ length: 10 }, (_, index) => spinnerFrame(index))).toEqual(['⠂', '⠒', '⠐', '⠰', '⠠', '⠤', '⠄', '⠆', '⠂', '⠒']);
		expect(renderSpinnerFrame('Working', 3)).toBe(' ⠰ Working\n');
		expect(renderSpinnerFrame('Working')).toBe(' ⠶ Working\n');
	});
});
