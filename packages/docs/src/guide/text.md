# Text

The `text` helper reads a single-line string.

```ts
import { text } from '@ollin/tui';

const name = await text({
	message: 'What is your name?',
	placeholder: 'Ada Lovelace',
	required: 'A name is required.',
	validate: (value) => (value.length < 2 ? 'Enter at least two characters.' : null),
});
```

## Options

`text` accepts `message`, `placeholder`, `default`, `required`, `hint`, `validate`, and `transform`.

The `validate` callback returns a string error message or `null`. Use callbacks when a prompt needs validation.

## Label-First Form

```ts
import { text } from '@ollin/tui';

const name = await text('What is your name?', 'Ada Lovelace', '', true);
```

## Complete Usage

```ts
import { text } from '@ollin/tui';

const project = await text({
	message: 'Project name',
	placeholder: 'acme-console',
	default: 'ollin-console',
	hint: 'Used in generated filenames.',
	required: 'A project name is required.',
	transform: (value) => value.trim().toLowerCase(),
	validate: (value) => (/^[a-z0-9-]+$/u.test(value) ? null : 'Use lowercase letters, numbers, and dashes.'),
});

const owner = await text('Owner name', 'Ada Lovelace', '', true);

void [project, owner];
```

## Consumer Call And Output

```ts
import { text } from '@ollin/tui';

const project = await text({
	message: 'Project name',
	default: 'ollin-console',
	required: true,
});
```

<TerminalOutput :lines='["? Project name","  ollin-console"]' />
