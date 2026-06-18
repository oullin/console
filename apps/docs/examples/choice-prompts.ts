import { autocomplete, confirm, multiselect, select, suggest } from '@ollin/console';

const roles = {
	member: 'Member',
	contributor: 'Contributor',
	owner: 'Owner',
};

export async function choicePromptExamples(): Promise<void> {
	const accepted = await confirm({
		message: 'Do you accept the terms?',
		default: false,
		yes: 'I accept',
		no: 'I decline',
		required: 'Accept the terms to continue.',
	});

	const role = await select({
		message: 'What role should the user have?',
		options: roles,
		default: 'member',
		info: (value) => (value === 'owner' ? 'Full access to the project.' : null),
	});

	const permissions = await multiselect({
		message: 'What permissions should be assigned?',
		options: {
			read: 'Read',
			create: 'Create',
			update: 'Update',
			delete: 'Delete',
		},
		default: ['read'],
		required: 'Select at least one permission.',
		validate: (values) => (values.includes('read') ? null : 'Every user needs read access.'),
	});

	const author = await suggest({
		message: 'Author name',
		options: (query) => ['Ada', 'Grace', 'Lin'].filter((name) => name.toLowerCase().includes(query.toLowerCase())),
		placeholder: 'Ada',
	});

	const runtime = await autocomplete({
		message: 'Runtime',
		options: ['Node.js', 'Bun', 'Deno'],
		default: 'Node.js',
	});

	void [accepted, role, permissions, author, runtime];
}
