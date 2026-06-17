import { describe, expect, it } from 'vitest';

import { createMemoryOutput, error, info, intro, note, outro, table, title, withPromptEnvironment } from '@ollin/console';

describe('output helpers', () => {
	it('writes output helpers', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			note('Hello');
			error('Nope');
			info('Facts');
			intro('Start');
			outro('Done');
			table({ headers: ['Name'], rows: [['Ollin']] });
			title('Demo');
		});

		expect(output.text()).toContain('Hello');
		expect(output.text()).toContain('Nope');
		expect(output.text()).toContain('Facts');
		expect(output.text()).toContain('Start');
		expect(output.text()).toContain('Done');
		expect(output.text()).toContain('| Name');
		expect(output.text()).toContain('\u001B]0;Demo\u0007');
	});
});
