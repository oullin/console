# Password

The `password` helper reads masked text input for sensitive values.

```ts
import { password } from '@ollin/console';

const token = await password({
	message: 'Enter your API token.',
	hint: 'Input is masked while typing.',
	required: true,
});
```

`password` shares the text prompt validation model. Use a typed callback for length, format, or application-specific checks.

```ts
import { password } from '@ollin/console';

const secret = await password({
	message: 'Secret',
	validate: (value) => (value.length < 8 ? 'Use at least eight characters.' : null),
});
```

## Complete Usage

```ts
import { password } from '@ollin/console';

const token = await password({
	message: 'API token',
	placeholder: 'token',
	hint: 'The token is not echoed to the terminal.',
	required: 'An API token is required.',
	validate: (value) => (value.length < 16 ? 'Tokens must be at least 16 characters.' : null),
	transform: (value) => value.trim(),
});

const confirmation = await password('Confirm API token', 'token', true);

void [token, confirmation];
```

## Consumer Call And Output

```ts
import { password } from '@ollin/console';

const token = await password({
	message: 'API token',
	required: true,
});
```

<TerminalOutput :lines='["? API token","  ********"]' />
