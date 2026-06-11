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

	it('keeps task logging finite for invalid limits', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task(
				'Running...',
				(logger) => {
					logger.log('line one');
					logger.log('line two');
				},
				-1,
			);
		});

		expect(output.text()).toContain('Running...');
		expect(output.text()).not.toContain('line one');
		expect(output.text()).not.toContain('line two');
		expect(output.text()).toContain('Done: Running...');
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

	it('keeps stable task summaries when requested', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task(
				'Running...',
				(logger) => {
					logger.line('line one');
					logger.success('created');
					logger.warning('check this');
					logger.error('failed optional step');
				},
				10,
				true,
			);
		});

		expect(output.text()).toContain('line one');
		expect(output.text()).toContain('success: created');
		expect(output.text()).toContain('warning: check this');
		expect(output.text()).toContain('error: failed optional step');
	});

	it('omits stable task summaries by default', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.success('created');
			});
		});

		expect(output.text()).not.toContain('success: created');
		expect(output.text()).toContain('Done: Running...');
	});

	it('accumulates partial task output until committed', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.partial('Downloading ');
				logger.partial('states');
				logger.commitPartial();
				logger.line('Done');
			});
		});

		expect(output.text()).toContain('Downloading states');
		expect(output.text()).toContain('Done');
		expect(output.text()).not.toContain('Downloading \n');
	});

	it('starts a new partial line after committing the previous partial', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.partial('one');
				logger.commitPartial();
				logger.partial('two');
				logger.commitPartial();
			});
		});

		expect(output.text()).toContain('one');
		expect(output.text()).toContain('two');
	});

	it('updates task labels through the logger', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.label('Building');
				logger.subLabel('assets');
			});
		});

		expect(output.text()).toContain('Running...');
		expect(output.text()).toContain('Done: Building assets');
	});

	it('clears task sub-labels through the logger', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task(
				'Running...',
				(logger) => {
					logger.label('Building');
					logger.subLabel('');
				},
				10,
				false,
				'assets',
			);
		});

		expect(output.text()).toContain('Running... assets');
		expect(output.text()).toContain('Done: Building');
		expect(output.text()).not.toContain('Done: Building assets');
	});
});
