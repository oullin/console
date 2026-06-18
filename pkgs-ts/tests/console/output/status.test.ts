import { describe, expect, it } from 'vitest';

import { createMemoryOutput, progress, spin, stream, withPromptEnvironment } from '@ollin/console';

describe('status helpers', () => {
	it('runs status helpers', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await spin(async () => 'done', { message: 'Working' });

			const bar = progress(2, 'Files');

			bar.advance();
			bar.advance();
			bar.finish();

			await stream(['a', 'b']);
		});

		expect(output.text()).toContain('Working');
		expect(output.text()).toContain('┌ Files ');
		expect(output.text()).toContain('2 / 2');
		expect(output.text()).toContain('ab');
	});
});
