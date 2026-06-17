# Testing

Use prompt environment helpers to exercise prompt flows without process input.

```ts
import { Key, createMemoryOutput, createScriptedInput, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada', Key.enter]);

const name = await withPromptEnvironment({ input, output }, () =>
	text({
		message: 'Name',
		required: true,
	}),
);

const rendered = output.text();
```

This uses the same exported helpers as application code. The scripted input supplies keys and lines, while memory output captures rendered terminal text.

## Complete Usage

```ts
import { Key, confirm, createMemoryOutput, createScriptedInput, select, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada', Key.enter, Key.down, Key.enter, 'y']);

const result = await withPromptEnvironment({ input, output }, async () => {
	const name = await text({
		message: 'Name',
		required: true,
	});

	const role = await select({
		message: 'Role',
		options: ['Member', 'Owner'],
		default: 'Member',
	});

	const active = await confirm({
		message: 'Active?',
		default: true,
	});

	return { active, name, role };
});

const rendered = output.text();

void [result, rendered];
```

## Consumer Call And Output

```ts
import { createMemoryOutput, createScriptedInput, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada']);

const name = await withPromptEnvironment({ input, output }, () => text({ message: 'Name' }));
const rendered = output.text();
```

<TerminalOutput :lines='["? Name","  Ada"]' />
