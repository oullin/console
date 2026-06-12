# Spin

The `spin` helper runs async work while rendering a spinner.

```ts
import { spin } from '@ollin/tui';

const result = await spin('Installing dependencies', async () => 'installed');
```

The callback result is returned after the spinner is cleared and terminal cursor state is restored.

## When To Use It

Use `spin` for one async operation where users only need to know that work is in progress. Use `progress` when the work has countable steps, and use `task` when the work should emit log lines.

## Complete Usage

```ts
import { form, spin } from '@ollin/tui';

const result = await spin('Installing dependencies', async () => {
	return 'installed';
});

const responses = await form()
	.spin('Loading workspace', async () => 'loaded', 'workspace')
	.text({ message: 'Next command', default: 'pnpm build' }, 'command')
	.submit();

void [result, responses];
```

## Behaviour

The callback return value is preserved, so `spin` can wrap existing application functions without changing their result type. If the callback throws, the error is rethrown after terminal cleanup.

## Consumer Call And Output

```ts
import { spin } from '@ollin/tui';

const result = await spin('Installing dependencies', async () => 'installed');
```

<TerminalOutput
	:delay="520"
	:frames='[
		["⠋ Installing dependencies"],
		["⠙ Installing dependencies"],
		["⠹ Installing dependencies"],
		["⠸ Installing dependencies"],
		["✓ installed"]
	]'
/>
