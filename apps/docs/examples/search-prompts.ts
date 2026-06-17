import { multisearch, search } from '@ollin/console';

const users = new Map([
	[1, 'Lin Chen'],
	[2, 'Ada Lovelace'],
	[3, 'Grace Hopper'],
]);

const matchingUsers = (query: string): Record<number, string> => Object.fromEntries([...users].filter(([, name]) => name.toLowerCase().includes(query.toLowerCase())));

export async function searchPromptExamples(): Promise<void> {
	const userId = await search({
		message: 'Search for the user receiving the email.',
		placeholder: 'Ada',
		options: matchingUsers,
		required: true,
		info: (value) => `User id ${value}`,
	});

	const userIds = await multisearch({
		message: 'Search for users receiving the email.',
		placeholder: 'Ada',
		options: matchingUsers,
		required: 'Select at least one user.',
	});

	void [userId, userIds];
}
