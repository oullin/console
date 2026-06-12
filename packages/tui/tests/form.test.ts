import { describe, expect, it } from 'vitest';
import { confirm, createMemoryOutput, createScriptedInput, form, Key, outro, text, withPromptEnvironment } from '#tui/index';

describe('form builder', () => {
	it('runs chained steps and returns positional responses', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', 'd', 'a', Key.enter, Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().text('Name').select('Runtime', ['TS', 'JS']).confirm('Active').submit(),
		);

		expect(responses[0]).toBe('Ada');
		expect(responses[1]).toBe('TS');
		expect(responses[2]).toBe(true);
	});

	it('keys named responses and passes prior responses and names to custom steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', 'd', 'a', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.text('Name', '', '', false, undefined, '', 'name')
					.add((values, previous, name) => `${name ?? 'missing'}:${previous ?? 'new'}:Hello ${values.name}`, 'greeting')
					.submit(),
		);

		expect(responses.name).toBe('Ada');
		expect(responses.greeting).toBe('greeting:new:Hello Ada');
	});

	it('stores null for skipped conditional steps', async () => {
		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['n']),
				output: createMemoryOutput(),
				error: createMemoryOutput(),
				interactive: true,
			},
			() =>
				form()
					.confirm('Include details?', false, 'Yes', 'No', false, undefined, '', 'include')
					.addIf(
						(values) => values.include === true,
						() => 'details',
						'details',
					)
					.submit(),
		);

		expect(responses.include).toBe(false);
		expect(responses.details).toBeNull();
	});

	it('reverts to the previous form step and reuses the prior response', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', Key.enter, 'B', Key.ctrlU, Key.backspace, 'C', Key.enter, 'D', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().text('First').text('Second').submit(),
		);

		expect(responses[0]).toBe('C');
		expect(responses[1]).toBe('D');
	});

	it('reuses numeric previous responses when reverting prompt builder steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['4', Key.enter, Key.ctrlU, '5', Key.enter, 'D', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().number('Count').text('Done').submit(),
		);

		expect(responses[0]).toBe(45);
		expect(responses[1]).toBe('D');
	});

	it('applies number transforms from form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['4', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.number('Count', '', '', false, undefined, '', undefined, undefined, undefined, 'count', (value) => Number(value) * 2)
					.submit(),
		);

		expect(responses.count).toBe(8);
	});

	it('reuses array previous responses when reverting prompt builder steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.space, Key.enter, Key.ctrlU, Key.enter, 'D', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().multiselect('Flags', ['alpha', 'beta']).text('Done').submit(),
		);

		expect(responses[0]).toEqual(['alpha']);
		expect(responses[1]).toBe('D');
	});

	it('reuses boolean previous responses when reverting confirm steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['n', Key.enter, Key.ctrlU, Key.enter, 'D', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().confirm('Active?').text('Done').submit(),
		);

		expect(responses[0]).toBe(false);
		expect(responses[1]).toBe('D');
	});

	it('reverts past ignored side-effect steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', Key.enter, 'B', Key.ctrlU, Key.backspace, 'C', Key.enter, 'D', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().text('First').note('Skipping back over this', null, 'note').text('Second').submit(),
		);

		expect(responses[0]).toBe('C');
		expect(responses.note).toBeNull();
		expect(responses[2]).toBe('D');
	});

	it('will not skip over the first step when reverting', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlU, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().info('This should not be skipped').confirm('Are you sure?').submit(),
		);

		expect(responses[0]).toBeNull();
		expect(responses[1]).toBe(true);
	});

	it('stops custom step execution at the moment of reverting', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment(
			{
				input: createScriptedInput(['2', '7', Key.enter, Key.down, Key.ctrlU, Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.text('Age')
					.add(async () => {
						const confirmed = await confirm('Are you sure?');

						if (!confirmed) {
							outro('This should not appear!');
						}
					})
					.submit(),
		);

		expect(output.text()).not.toContain('This should not appear!');
	});

	it('re-evaluates conditional steps after reverting prior responses', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', 'd', 'a', Key.enter, Key.down, Key.enter, Key.ctrlU, Key.up, Key.enter, '1', Key.enter, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.text('Name')
					.select('Runtime', ['TS', 'JS'])
					.addIf(
						(values) => values[1] === 'TS',
						() => text('Version'),
					)
					.confirm('Are you sure?')
					.submit(),
		);

		expect(responses[0]).toBe('Ada');
		expect(responses[1]).toBe('TS');
		expect(responses[2]).toBe('1');
		expect(responses[3]).toBe(true);
	});

	it('uses declared defaults when named choice steps follow skipped conditional responses', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.addIf(false, () => 'skipped', 'choice')
					.select('Choice', { a: 'A', b: 'B' }, 'b', 5, undefined, '', true, 'choice')
					.addIf(false, () => 'skipped', 'searched')
					.search({ message: 'Search', options: { red: 'Red', blue: 'Blue' }, default: 'blue' }, 'searched')
					.submit(),
		);

		expect(responses.choice).toBe('b');
		expect(responses.searched).toBe('blue');
	});

	it('does not revert the first form step', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.ctrlU, 'A', Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().text('First').submit(),
		);

		expect(responses[0]).toBe('A');
		expect(output.text()).toContain('This cannot be reverted.');
	});

	it('does not allow reverting a normal prompt after form submit', async () => {
		const output = createMemoryOutput();

		const confirmed = await withPromptEnvironment(
			{
				input: createScriptedInput(['A', Key.enter, Key.ctrlU, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			async () => {
				await form().text('Name').submit();

				return confirm('Ready?');
			},
		);

		expect(confirmed).toBe(true);
		expect(output.text()).toContain('This cannot be reverted.');
	});

	it('runs suggest, search, and multisearch form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['b', Key.tab, Key.enter, 'g', Key.down, Key.enter, 'r', Key.down, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.suggest('Suggested color', ['Red', 'Green', 'Blue'], '', '', 5, false, undefined, '', 'suggested')
					.search(
						{
							message: 'Searched color',
							options: (value) => {
								const options = { green: 'Green', blue: 'Blue', red: 'Red' };

								return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
							},
						},
						'searched',
					)
					.multisearch(
						{
							message: 'Many colors',
							options: (value) => {
								const options = { red: 'Red', green: 'Green', blue: 'Blue' };

								return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
							},
						},
						'many',
					)
					.submit(),
		);

		expect(responses.suggested).toBe('Blue');
		expect(responses.searched).toBe('green');
		expect(responses.many).toEqual(['red']);
	});

	it('passes suggest placeholders and defaults from form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().suggest('Suggested color', ['Red', 'Green', 'Blue'], 'Type a color', 'Blue', 5, false, undefined, '', 'suggested').submit(),
		);

		expect(responses.suggested).toBe('Blue');
	});

	it('passes autocomplete placeholders from form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() => form().autocomplete('Auto color', ['Red', 'Green', 'Blue'], 'Type a color', '', false, undefined, '', 'auto').submit(),
		);

		expect(responses.auto).toBe('');
		expect(output.text()).toContain('Type a color');
	});

	it('runs label-first search and multisearch form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['g', Key.down, Key.enter, 'r', Key.down, Key.space, Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.search(
						'Searched color',
						(value) => {
							const options = { green: 'Green', blue: 'Blue', red: 'Red' };

							return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
						},
						'',
						5,
						undefined,
						'',
						true,
						'searched',
					)
					.multisearch(
						'Many colors',
						(value) => {
							const options = { red: 'Red', green: 'Green', blue: 'Blue' };

							return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
						},
						'',
						5,
						false,
						undefined,
						'Use the space bar to select options.',
						'many',
					)
					.submit(),
		);

		expect(responses.searched).toBe('green');
		expect(responses.many).toEqual(['red']);
	});

	it('reuses previous search responses when reverting object-option form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['g', Key.down, Key.enter, Key.ctrlU]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.search(
						{
							message: 'Searched color',
							options: (value) => {
								const options = { green: 'Green', blue: 'Blue', red: 'Red' };

								return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
							},
						},
						'searched',
					)
					.confirm('Done?')
					.submit(),
		);

		expect(responses.searched).toBe('green');
	});

	it('reuses previous multisearch responses when reverting object-option form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['r', Key.down, Key.space, Key.enter, Key.ctrlU]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.multisearch(
						{
							message: 'Many colors',
							options: (value) => {
								const options = { red: 'Red', green: 'Green', blue: 'Blue' };

								return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
							},
						},
						'many',
					)
					.confirm('Done?')
					.submit(),
		);

		expect(responses.many).toEqual(['red']);
	});

	it('runs password and textarea form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput(['s', 'e', 'c', 'r', 'e', 't', Key.enter, 'L', '1', Key.enter, 'L', '2', Key.ctrlD]),
				output,
				error: output,
				interactive: true,
			},
			() => form().password('Secret', '', false, undefined, '', 'secret').textarea('Body', '', '', false, undefined, '', 3, 'body').submit(),
		);

		expect(responses.secret).toBe('secret');
		expect(responses.body).toBe('L1\nL2');
	});

	it('runs task, pause, and stream form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				input: createScriptedInput([Key.enter]),
				output,
				error: output,
				interactive: true,
			},
			() =>
				form()
					.task(
						'Build',
						(logger) => {
							logger.log('done');

							return 1;
						},
						10,
						false,
						'',
						'task',
					)
					.pause('Continue')
					.stream(['line one\n'], 'streamed')
					.submit(),
		);

		expect(responses.task).toBe(1);
		expect(responses[1]).toBe(true);
		expect(responses.streamed).toBeNull();
		expect(output.text()).toContain('Build');
		expect(output.text()).toContain('line one');
	});

	it('runs spin and progress form steps', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				output,
				error: output,
			},
			() =>
				form()
					.spin(async () => 'spun', undefined, 'spin')
					.progress('Files', [1, 2], (step) => Number(step) * 2, '', 'progress')
					.submit(),
		);

		expect(responses.spin).toBe('spun');
		expect(responses.progress).toEqual([2, 4]);
		expect(output.text()).toContain(' ⠶ ');
		expect(output.text()).not.toContain('Loading');
		expect(output.text()).not.toContain('Done:');
		expect(output.text()).toContain('Files');
		expect(output.text()).toContain('2 / 2');
	});

	it('stores null for display-only output helper responses', async () => {
		const output = createMemoryOutput();

		const responses = await withPromptEnvironment(
			{
				output,
				error: output,
			},
			() =>
				form()
					.note('Saved', null, 'note')
					.table(['Name'], [['Ollin']], 'table')
					.submit(),
		);

		expect(responses.note).toBeNull();
		expect(responses.table).toBeNull();
	});
});
