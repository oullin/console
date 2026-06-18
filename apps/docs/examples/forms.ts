import { form } from '@ollin/console';

export async function formExample(): Promise<void> {
	const responses = await form()
		.intro('Create an account')
		.text({ message: 'Name', required: true }, 'name')
		.confirm({ message: 'Enable notifications?', default: true }, 'notifications')
		.addIf(
			(responses) => responses.notifications === true,
			async () => 'email',
			'notificationChannel',
		)
		.outro('Account configured')
		.submit();

	void responses;
}

export async function callbackFormExample(): Promise<void> {
	const responses = await form(async (builder) =>
		builder
			.text({ message: 'Project name', required: true }, 'project')
			.select({ message: 'Visibility', options: ['Private', 'Public'], default: 'Private' }, 'visibility')
			.submit(),
	);

	void responses;
}
