# Autocomplete

The `autocomplete` helper completes the current input from known options.

```ts
import { autocomplete } from '@ollin/tui';

const runtime = await autocomplete({
	message: 'Runtime',
	options: ['Node.js', 'Bun', 'Deno'],
	default: 'Node.js',
});
```

Use `autocomplete` when users should enter one value and suggestions should guide them toward a known set.

Use `suggest` instead when arbitrary values are common and suggestions are only hints.

## Complete Usage

```ts
import { autocomplete } from '@ollin/tui';

const runtime = await autocomplete({
	message: 'Runtime',
	options: ['Node.js', 'Bun', 'Deno'],
	placeholder: 'Node.js',
	default: 'Node.js',
	required: true,
	info: (value) => (value === 'Bun' ? 'Fast JavaScript runtime.' : null),
	validate: (value) => (value === 'Deno' ? 'Deno is not enabled in this project.' : null),
});

const packageManager = await autocomplete('Package manager', ['pnpm', 'npm', 'yarn'], 'pnpm');

void [runtime, packageManager];
```

## Consumer Call And Output

```ts
import { autocomplete } from '@ollin/tui';

const runtime = await autocomplete({
	message: 'Runtime',
	options: ['Node.js', 'Bun', 'Deno'],
	default: 'Node.js',
});
```

<TerminalOutput :lines='["? Runtime","  Node.js"]' />
