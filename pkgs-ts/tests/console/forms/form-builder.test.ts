import { describe, expect, it } from 'vitest';

import { form } from '@ollin/console';

import { scripted } from '../support/scripted';

describe('form builders', () => {
	it('runs form builders', async () => {
		const response = await scripted(['A', 'd', 'a', '\n', 'y'], () =>
			form().text('Name', '', '', false, undefined, '', 'name').confirm('Active', true, 'Yes', 'No', false, undefined, '', 'active').submit(),
		);

		expect(response.result.name).toBe('Ada');
		expect(response.result.active).toBe(true);
	});
});
