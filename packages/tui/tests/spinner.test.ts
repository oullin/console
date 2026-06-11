import { describe, expect, it } from 'vitest';
import { createMemoryOutput, spin, withPromptEnvironment } from '#tui/index';

describe('spinner helper', () => {
	it('runs callback-first spinner callbacks', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment({ output, error: output }, async () => {
			return spin(async () => 'done', { message: 'Working' });
		});

		expect(result).toBe('done');
		expect(output.text()).toContain('Working...');
		expect(output.text()).toContain('Done: Working');
	});

	it('runs label-first spinner callbacks', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment({ output, error: output }, async () => {
			return spin('Working', async () => 'done');
		});

		expect(result).toBe('done');
		expect(output.text()).toContain('Working...');
		expect(output.text()).toContain('Done: Working');
	});

	it('writes failure output before rethrowing spinner errors', async () => {
		const output = createMemoryOutput();
		const failure = new Error('failed');

		await expect(
			withPromptEnvironment({ output, error: output }, async () => {
				await spin('Working', async () => {
					throw failure;
				});
			}),
		).rejects.toBe(failure);

		expect(output.text()).toContain('Working...');
		expect(output.text()).toContain('Failed: Working');
		expect(output.text()).not.toContain('Done: Working');
	});
});
