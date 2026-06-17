# Forms

The `form` helper composes prompt, output, and status steps into one submission flow.

```ts
import { form } from '@ollin/console';

const responses = await form()
	.intro('Create an account')
	.text({ message: 'Name', required: true }, 'name')
	.confirm({ message: 'Enable notifications?', default: true }, 'notifications')
	.outro('Account configured')
	.submit();
```

Named steps are written into the response object. The builder also supports conditional steps with `addIf`.

```ts
import { form } from '@ollin/console';

await form()
	.confirm({ message: 'Enable notifications?', default: true }, 'notifications')
	.addIf(
		(responses) => responses.notifications === true,
		async () => 'email',
		'notificationChannel',
	)
	.submit();
```

You can also pass an async callback to `form` and submit from inside the callback.

## Complete Usage

```ts
import { form } from '@ollin/console';

const responses = await form(async (builder) =>
	builder
		.intro('Create a project')
		.text({ message: 'Project name', required: true }, 'project')
		.select(
			{
				message: 'Visibility',
				options: ['Private', 'Public'],
				default: 'Private',
			},
			'visibility',
		)
		.multiselect(
			{
				message: 'Features',
				options: ['docs', 'tests', 'release'],
				default: ['docs'],
				required: true,
			},
			'features',
		)
		.addIf(
			(values) => Array.isArray(values.features) && values.features.includes('release'),
			async () => 'manual-approval',
			'releasePolicy',
		)
		.table(['Field', 'Value'], [['Status', 'Configured']], 'summary')
		.outro('Project configured')
		.submit(),
);

void responses;
```

## Consumer Call And Output

```ts
import { form } from '@ollin/console';

const responses = await form()
	.text({ message: 'Project name', required: true }, 'project')
	.select({ message: 'Visibility', options: ['Private', 'Public'], default: 'Private' }, 'visibility')
	.submit();
```

<TerminalOutput :lines='["? Project name","  docs-site","? Visibility","  Private"]' />
