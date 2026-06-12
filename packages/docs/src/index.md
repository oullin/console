# @ollin/tui

Prompt and terminal helpers for command-line applications.

Start with the [guide](/guide/introduction), or open the generated [API reference](/api/).

These docs cover the public API and common command-line workflows.

## Build a Prompted Command

```ts
import { form, table, task } from '@ollin/tui';

const answers = await form()
	.text({ message: 'Package name', required: true }, 'name')
	.select({ message: 'Template', options: ['library', 'cli', 'docs'], default: 'cli' }, 'template')
	.confirm({ message: 'Install dependencies?', default: true }, 'install')
	.submit();

await task('Creating package', async (logger) => {
	logger.info(`Template: ${answers.template}`);
	logger.success('Package configured');
});

table(['Field', 'Value'], [
	['Package', String(answers.name)],
	['Template', String(answers.template)],
	['Install', String(answers.install)],
]);
```

## What To Read First

- Use [Available Prompts](/guide/available-prompts) for the helper map.
- Use [Forms](/guide/forms) when a command needs multiple steps.
- Use [Testing](/guide/testing) when you need deterministic prompt input.
- Use [API Reference](/api/) for generated types and overloads.

## Consumer Call And Output

```ts
import { text } from '@ollin/tui';

const name = await text({ message: 'Package name', default: 'cli-tools' });
```

<TerminalOutput :lines='["? Package name","  cli-tools"]' />
