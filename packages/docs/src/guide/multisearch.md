# Multi-search

The `multisearch` helper combines search input with multiple selected results.

```ts
import { multisearch } from '@ollin/tui';

const userIds = await multisearch({
	message: 'Search for users receiving the email.',
	placeholder: 'Ada',
	options: (query) => ({
		1: 'Lin Chen',
		2: 'Ada Lovelace',
		3: 'Grace Hopper',
	}),
	required: 'Select at least one user.',
});
```

Use this helper when the option set is too large for `multiselect` and should be narrowed by typed input.

## Complete Usage

```ts
import { multisearch } from '@ollin/tui';

const users = {
	1: 'Lin Chen',
	2: 'Ada Lovelace',
	3: 'Grace Hopper',
};

const reviewers = await multisearch({
	message: 'Search for reviewers.',
	placeholder: 'Ada',
	options: (query) => Object.fromEntries(Object.entries(users).filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()))),
	scroll: 10,
	required: 'Select at least one reviewer.',
	validate: (values) => (values.length > 3 ? 'Select no more than three reviewers.' : null),
});

const labels = await multisearch({
	message: 'Labels',
	options: ['bug', 'docs', 'feature'],
	default: ['docs'],
});

void [reviewers, labels];
```

## Consumer Call And Output

```ts
import { multisearch } from '@ollin/tui';

const reviewers = await multisearch({
	message: 'Reviewers',
	options: ['Ada Lovelace', 'Grace Hopper', 'Lin Chen'],
	required: true,
});
```

<TerminalOutput :lines='["? Reviewers","  Ada Lovelace, Grace Hopper"]' />
