import { describe, expect, it } from 'vitest';
import { createMemoryOutput, task, withPromptEnvironment } from '#tui/index';
import { renderTaskFrame } from '#tui/status/task/render';

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
		expect(output.text()).toContain(' ⠶ Running...');
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

	it('strips carriage returns from task log lines', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.log('before\rafter');
			});
		});

		expect(output.text()).toContain('beforeafter');
	});

	it('trims trailing whitespace from completed log lines', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.line('trailing   ');
			});
		});

		expect(output.text()).toContain('trailing\n');
		expect(output.text()).not.toContain('trailing   \n');
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

		expect(output.text()).not.toContain('line one');
		expect(output.text()).toContain(' • Running...');
		expect(output.text()).toContain('✔ created');
		expect(output.text()).toContain('⚠ check this');
		expect(output.text()).toContain('✘ failed optional step');
	});

	it('bounds stable task summaries with the task log limit', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task(
				'Running...',
				(logger) => {
					logger.success('first');
					logger.warning('second');
					logger.error('third');
				},
				2,
				true,
			);
		});

		expect(output.text()).not.toContain('success: first');
		expect(output.text()).toContain('⚠ second');
		expect(output.text()).toContain('✘ third');
	});

	it('omits stable task summaries by default', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.success('created');
			});
		});

		expect(output.text()).not.toContain('success: created');
		expect(output.text()).not.toContain('✔ created');
		expect(output.text()).toContain(' ⠶ Running...');
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

	it('preserves trailing spaces while partial output is still accumulating', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await task('Running...', (logger) => {
				logger.partial('Downloading ');
			});
		});

		expect(output.text()).toContain('Downloading \n');
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
		expect(output.text()).toContain(' ⠶ Building');
		expect(output.text()).toContain('assets');
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

		expect(output.text()).toContain(' ⠶ Running...\n   assets');
		expect(output.text()).toContain(' ⠶ Building');
		expect(output.text()).not.toContain(' ⠶ Building\n   assets');
	});

	it('renders deterministic animated task frames', () => {
		expect(
			renderTaskFrame({
				frameCount: 2,
				label: 'Running...',
				limit: 2,
				lines: ['line one'],
				stableMessages: [],
			}),
		).toContain(' ⠐ Running...');

		expect(
			renderTaskFrame({
				label: 'Running...',
				limit: 2,
				lines: [],
				stableMessages: [],
			}),
		).toContain(' ⠶ Running...');
	});
});
