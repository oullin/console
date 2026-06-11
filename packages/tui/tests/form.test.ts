import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, form, Key, withPromptEnvironment } from '#tui/index';

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
					.suggest('Suggested color', ['Red', 'Green', 'Blue'], '', 5, false, undefined, '', 'suggested')
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
		expect(responses.streamed).toBeNull();
		expect(output.text()).toContain('Build');
		expect(output.text()).toContain('line one');
	});
});
