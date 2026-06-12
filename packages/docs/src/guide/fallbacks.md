# Custom Environments

`@ollin/tui` uses `PromptEnvironment` as the boundary for input, output, and interactivity.

Use `withPromptEnvironment` when a command needs custom streams or deterministic input.

```ts
import { createMemoryOutput, createScriptedInput, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada']);

const name = await withPromptEnvironment({ input, output }, () =>
	text({
		message: 'Name',
		required: true,
	}),
);
```

Keep environment-specific behaviour near the command entrypoint so prompt code can stay portable.

## Complete Usage

```ts
import { createMemoryOutput, createScriptedInput, select, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada', 'Member']);

const result = await withPromptEnvironment({ input, interactive: false, output }, async () => {
	const name = await text({
		message: 'Name',
		default: 'Ada',
		required: true,
	});

	const role = await select({
		message: 'Role',
		options: ['Member', 'Owner'],
		default: 'Member',
	});

	return { name, role };
});

void [result, output.text()];
```

## Consumer Call And Output

```ts
import { createMemoryOutput, createScriptedInput, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada']);

const name = await withPromptEnvironment({ input, output }, () => text({ message: 'Name' }));
```

<TerminalOutput :lines='["? Name","  Ada"]' />
