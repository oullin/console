import { describe, expect, it } from 'vitest';

import { confirm, multiselect, number, select, text } from '@ollin/console';

import { scripted } from '../support/scripted';

describe('prompt helpers', () => {
	it('reads text and number prompts', async () => {
		await expect(scripted(['A', 'd', 'a', '\n'], () => text('Name'))).resolves.toMatchObject({ result: 'Ada' });

		await expect(scripted(['4', '2', '\n'], () => number({ message: 'Age', integer: true }))).resolves.toMatchObject({ result: 42 });
	});

	it('reads confirm and choice prompts', async () => {
		await expect(scripted(['n'], () => confirm('Continue'))).resolves.toMatchObject({ result: false });

		await expect(
			scripted(['2'], () =>
				select({
					message: 'Framework',
					options: ['Ollin', 'Vue'],
				}),
			),
		).resolves.toMatchObject({ result: 'Vue' });

		await expect(
			scripted(['1,2'], () =>
				multiselect({
					message: 'Tools',
					options: ['Prompts', 'OpenTUI'],
				}),
			),
		).resolves.toMatchObject({ result: ['Prompts', 'OpenTUI'] });
	});
});
