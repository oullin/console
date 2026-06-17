# @ollin/tui

Prompt and terminal helpers for command-line applications.

Start with the [guide](/guide/introduction), or open the generated [API reference](/api/).

These docs cover the public API and common command-line workflows.

## Current Stage

`@ollin/tui` is currently implemented as a TypeScript ESM package with a public root entrypoint for prompts, forms, output helpers, status indicators, terminal helpers, string and key utilities, and deterministic prompt environments.

The guide pages describe the tracked public surface, while the generated API reference is built from the package types. Runtime and type-consumption behavior is covered by the workspace test suites, including the acceptance package. The detailed parity map and completion audit live in `UPSTREAM.md`.

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
