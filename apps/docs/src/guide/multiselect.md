# Multi-select

The `multiselect` helper asks the user to choose multiple values.

```ts
import { multiselect } from '@ollin/console';

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
```

By default, multiple-selection prompts can return an empty array. Use `required` to require at least one selected item.

## Complete Usage

```ts
import { multiselect } from '@ollin/console';

const permissions = await multiselect({
	message: 'What permissions should be assigned?',
	options: {
		read: 'Read',
		create: 'Create',
		update: 'Update',
		delete: 'Delete',
	},
	default: ['read'],
	scroll: 5,
	required: 'Select at least one permission.',
	info: (value) => (value === 'delete' ? 'Allows permanent deletion.' : null),
	validate: (values) => (values.includes('read') ? null : 'Every user needs read access.'),
});

const checks = await multiselect('Checks to run', ['typecheck', 'build', 'smoke'], ['typecheck']);

void [permissions, checks];
```

## Consumer Call And Output

```ts
import { multiselect } from '@ollin/console';

const checks = await multiselect({
	message: 'Checks to run',
	options: ['typecheck', 'build', 'smoke'],
	default: ['typecheck', 'build'],
	required: true,
});
```

<TerminalOutput :lines='["? Checks to run","  typecheck, build"]' />
