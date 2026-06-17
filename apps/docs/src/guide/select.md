# Select

The `select` helper asks the user to choose one item.

```ts
import { select } from '@ollin/console';

const role = await select({
	message: 'What role should the user have?',
	options: {
		member: 'Member',
		contributor: 'Contributor',
		owner: 'Owner',
	},
	default: 'member',
	info: (value) => (value === 'owner' ? 'Full access to the project.' : null),
});
```

Associative options return the selected key. Array options return the selected value.

## Validation

`select` always returns one value. Use `validate` if a visible option may be unavailable.

```ts
import { select } from '@ollin/console';

const role = await select({
	message: 'Role',
	options: ['Member', 'Owner'],
	validate: (value) => (value === 'Owner' ? 'An owner already exists.' : null),
});
```

## Complete Usage

```ts
import { select } from '@ollin/console';

const role = await select({
	message: 'What role should the user have?',
	options: {
		member: 'Member',
		contributor: 'Contributor',
		owner: 'Owner',
	},
	default: 'member',
	scroll: 5,
	hint: 'The role can be changed later.',
	info: (value) => (value === 'owner' ? 'Full access to all resources.' : null),
	validate: (value) => (value === 'owner' ? 'Owner access requires a separate approval.' : null),
});

const channel = await select('Release channel', ['stable', 'beta', 'nightly'], 'stable');

void [role, channel];
```

## Consumer Call And Output

```ts
import { select } from '@ollin/console';

const channel = await select({
	message: 'Release channel',
	options: ['stable', 'beta', 'nightly'],
	default: 'stable',
});
```

<TerminalOutput :lines='["? Release channel","  stable"]' />
