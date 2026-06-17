# Terminal Considerations

`@ollin/tui` represents terminal IO through `PromptEnvironment`. The default environment reads from the process input and writes to process output. Tests and non-standard runtimes can replace those streams.

```ts
import { promptEnvironment, terminalSize } from '@ollin/tui';

const environment = promptEnvironment();
const size = terminalSize();

void [environment, size];
```

Terminal helpers restore cursor state around status renderers such as `spin`, `progress`, `task`, and `stream`.

## Prompt Environment

`PromptEnvironment` is the main portability boundary. It allows application code to use the same `text`, `select`, `task`, and output helpers in process terminals, scripted tests, or custom runtimes.

## Complete Usage

```ts
import { createMemoryOutput, createScriptedInput, promptEnvironment, terminalSize, text, withPromptEnvironment } from '@ollin/tui';

const current = promptEnvironment();
const size = terminalSize();

const output = createMemoryOutput();
const input = createScriptedInput(['Ada']);

const name = await withPromptEnvironment({ input, interactive: false, output }, () =>
	text({
		message: 'Name',
		default: 'Ada',
	}),
);

void [current, size, name, output.text()];
```

## Practical Guidance

Keep process-specific assumptions near your application entrypoint. Library code should accept dependencies or run under `withPromptEnvironment` when it needs deterministic input/output behaviour.

## Consumer Call And Output

```ts
import { createMemoryOutput, createScriptedInput, text, withPromptEnvironment } from '@ollin/tui';

const output = createMemoryOutput();
const input = createScriptedInput(['Ada']);

const name = await withPromptEnvironment({ input, output }, () => text({ message: 'Name' }));
```

<TerminalOutput :lines='["? Name","  Ada"]' />
