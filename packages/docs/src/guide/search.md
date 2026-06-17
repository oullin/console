# Search

The `search` helper filters options as the user types and returns one selected value.

```ts
import { search } from '@ollin/tui';

const userId = await search({
	message: 'Search for the user receiving the email.',
	placeholder: 'Ada',
	options: (query) => ({
		1: 'Ada Lovelace',
		2: 'Ada Lovelace',
		3: 'Grace Hopper',
	}),
	required: true,
	info: (value) => `User id ${value}`,
});
```

When `options` returns an object, the selected key is returned. When it returns an array, the selected value is returned.

## Complete Usage

```ts
import { search } from '@ollin/tui';

const users = new Map([
	[1, 'Lin Chen'],
	[2, 'Ada Lovelace'],
	[3, 'Grace Hopper'],
]);

const userId = await search({
	message: 'Search for the user receiving the email.',
	placeholder: 'Ada',
	options: (query) => Object.fromEntries([...users].filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()))),
	scroll: 10,
	required: true,
	info: (value) => `User id ${value}`,
	validate: (value) => (Number(value) === 1 ? 'Lin is unavailable.' : null),
});

const userName = await search('Pick a reviewer', ['Ada Lovelace', 'Grace Hopper']);

void [userId, userName];
```

## Consumer Call And Output

```ts
import { search } from '@ollin/tui';

const reviewer = await search({
	message: 'Reviewer',
	options: ['Ada Lovelace', 'Grace Hopper', 'Lin Chen'],
	required: true,
});
```

<TerminalOutput :lines='["? Reviewer","  Grace Hopper"]' />
