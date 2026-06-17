# Confirm

The `confirm` helper asks for a boolean response.

```ts
import { confirm } from '@ollin/tui';

const accepted = await confirm({
	message: 'Do you accept the terms?',
	default: false,
	yes: 'I accept',
	no: 'I decline',
	required: 'Accept the terms to continue.',
});
```

`confirm` returns `true` or `false`. When `required` is enabled, a negative answer is rejected with the default or custom message.

## Complete Usage

```ts
import { confirm } from '@ollin/tui';

const accepted = await confirm({
	message: 'Do you accept the terms?',
	default: false,
	yes: 'I accept',
	no: 'I decline',
	hint: 'Required before the command can continue.',
	required: 'Accept the terms to continue.',
	transform: (value) => value,
});

const overwrite = await confirm('Overwrite existing files?', false, 'Overwrite', 'Cancel');

void [accepted, overwrite];
```

## Consumer Call And Output

```ts
import { confirm } from '@ollin/tui';

const publish = await confirm({
	message: 'Publish release?',
	default: false,
});
```

<TerminalOutput :lines='["? Publish release?","  No"]' />
