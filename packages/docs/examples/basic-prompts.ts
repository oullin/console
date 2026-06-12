import { number, password, text, textarea } from '@ollin/tui';

export async function basicPromptExamples(): Promise<void> {
	const name = await text({
		message: 'What is your name?',
		placeholder: 'Ada Lovelace',
		required: 'A name is required.',
		validate: (value) => (value.length < 2 ? 'Enter at least two characters.' : null),
	});

	const biography = await textarea({
		message: 'Tell us about your project.',
		placeholder: 'This project helps...',
		rows: 5,
		required: true,
	});

	const copies = await number({
		message: 'How many copies?',
		default: 1,
		integer: true,
		min: 1,
		max: 100,
		validate: (value) => (Number(value) > 100 ? 'Choose 100 or fewer copies.' : null),
	});

	const token = await password({
		message: 'Enter your API token.',
		hint: 'Input is masked while typing.',
		required: true,
	});

	void [name, biography, copies, token];
}

export async function labelFirstPromptExamples(): Promise<void> {
	const name = await text('What is your name?', 'Ada Lovelace', '', true);

	const copies = await number('How many copies?', '5', 1, true);

	void [name, copies];
}
