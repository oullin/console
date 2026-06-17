# Textarea

The `textarea` helper reads multi-line input.

```ts
import { textarea } from '@ollin/tui';

const biography = await textarea({
	message: 'Tell us about your project.',
	placeholder: 'This project helps...',
	rows: 5,
	required: true,
});
```

## Options

`textarea` supports the text prompt options plus `rows`.

Use `validate` for custom checks and `transform` to normalise the submitted string before validation.

## Complete Usage

```ts
import { textarea } from '@ollin/tui';

const summary = await textarea({
	message: 'Release notes',
	placeholder: 'Added a new prompt flow...',
	rows: 6,
	hint: 'Markdown is accepted.',
	required: 'Release notes are required.',
	transform: (value) => value.trim(),
	validate: (value) => (value.length < 20 ? 'Write at least 20 characters.' : null),
});

const supportMessage = await textarea('Support message', 'Describe the issue', '', true);

void [summary, supportMessage];
```

## Consumer Call And Output

```ts
import { textarea } from '@ollin/tui';

const notes = await textarea({
	message: 'Release notes',
	rows: 4,
	required: true,
});
```

<TerminalOutput :lines='["? Release notes","  Added command documentation.","  Improved prompt validation."]' />
