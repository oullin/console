# Suggest

The `suggest` helper offers completions while still allowing any typed value.

```ts
import { suggest } from '@ollin/tui';

const author = await suggest({
	message: 'Author name',
	options: (query) => ['Ada', 'Grace', 'Lin'].filter((name) => name.toLowerCase().includes(query.toLowerCase())),
	placeholder: 'Ada',
});
```

`options` can be an array or a callback that receives the current query.

Use `required`, `validate`, and `transform` the same way you would on `text`.

## Complete Usage

```ts
import { suggest } from '@ollin/tui';

const names = ['Ada', 'Grace', 'Lin', 'Katherine'];

const author = await suggest({
	message: 'Author name',
	options: (query) => names.filter((name) => name.toLowerCase().includes(query.toLowerCase())),
	placeholder: 'Ada',
	default: 'Ada',
	scroll: 5,
	required: true,
	info: (value) => (value === 'Ada' ? 'Default maintainer.' : null),
	validate: (value) => (value.length < 2 ? 'Enter at least two characters.' : null),
});

const reviewer = await suggest('Reviewer', names, 'Grace');

void [author, reviewer];
```

## Consumer Call And Output

```ts
import { suggest } from '@ollin/tui';

const maintainer = await suggest({
	message: 'Maintainer',
	options: ['Ada', 'Grace', 'Lin'],
	default: 'Ada',
});
```

<TerminalOutput :lines='["? Maintainer","  Ada"]' />
