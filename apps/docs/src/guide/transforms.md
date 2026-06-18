# Transforming Input Before Validation

Prompt options can include `transform`. The transform runs on the submitted value before validation completes.

```ts
import { text } from '@ollin/console';

const slug = await text({
	message: 'Project slug',
	transform: (value) => value.trim().toLowerCase().replaceAll(' ', '-'),
	validate: (value) => (/^[a-z0-9-]+$/u.test(value) ? null : 'Use letters, numbers, and dashes.'),
});
```

Transforms can be synchronous or asynchronous. Use them for normalisation that belongs to the prompt boundary.

Use callbacks for `validate` and `transform`.

## Complete Usage

```ts
import { confirm, multiselect, number, text } from '@ollin/console';

const slug = await text({
	message: 'Project slug',
	transform: (value) => value.trim().toLowerCase().replaceAll(' ', '-'),
	validate: (value) => (/^[a-z0-9-]+$/u.test(value) ? null : 'Use letters, numbers, and dashes.'),
});

const seats = await number({
	message: 'Seats',
	transform: (value) => Number(value),
	validate: (value) => (Number(value) >= 1 ? null : 'Choose at least one seat.'),
});

const permissions = await multiselect({
	message: 'Permissions',
	options: ['Read', 'Write', 'Delete'],
	transform: (values) => values.map((value) => value.toLowerCase()),
});

const publish = await confirm({
	message: 'Publish?',
	transform: (value) => Boolean(value),
});

void [slug, seats, permissions, publish];
```

## Consumer Call And Output

```ts
import { text } from '@ollin/console';

const slug = await text({
	message: 'Project slug',
	transform: (value) => value.trim().toLowerCase().replaceAll(' ', '-'),
});
```

<TerminalOutput :lines='["? Project slug","  ollin tools","> ollin-tools"]' />
