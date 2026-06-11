import { describe, expect, it } from 'vitest';
import { createMemoryOutput, task, withPromptEnvironment } from '#tui/index';

describe('task helper', () => {
	it('passes a bounded logger to the callback and returns the callback value', async () => {
		const output = createMemoryOutput();

		const result = await withPromptEnvironment({ output, error: output }, async () => {
			return task(
				'Running...',
				(logger) => {
					logger.log('line one');
					logger.log('line two');
					logger.log('line three');

					return 'done';
				},
				2,
			);
		});

		expect(result).toBe('done');
		expect(output.text()).toContain('Running...');
		expect(output.text()).not.toContain('line one');
		expect(output.text()).toContain('line two');
		expect(output.text()).toContain('line three');
	});

	it('strips cursor reset control sequences from log lines', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.log('before\u001B[1G\u001B[2Kafter');
			});
		});

		expect(output.text()).toContain('beforeafter');
	});
});
