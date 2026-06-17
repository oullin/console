# Introduction

`@ollin/console` is a prompt toolkit for command-line applications. It exposes prompt helpers, form composition, terminal output helpers, status indicators, and a testable prompt environment from the public `@ollin/console` entrypoint.

This guide documents the current `@ollin/console` package surface with examples you can adapt directly in commands.

## What Is Included

The package exports prompt helpers such as `text`, `textarea`, `number`, `password`, `confirm`, `select`, `multiselect`, `suggest`, `autocomplete`, `search`, `multisearch`, and `pause`.

It also exports `form`, output helpers such as `info`, `warning`, `table`, and `dataTable`, status helpers such as `spin`, `progress`, `task`, and `stream`, and terminal helpers such as `title` and `clear`.

## Package Overview

The package is implemented as TypeScript-first ESM and exposes its supported runtime surface through the public `@ollin/console` entrypoint. The current implementation includes prompt helpers, form composition, output and status helpers, terminal controls, string and key utilities, OpenTUI text-frame rendering, and deterministic environments for tests or non-standard runtimes.

The documentation follows that public package surface. Use the guide for task-oriented examples and the API reference for generated type and overload details. Runtime behavior and package consumption are covered by local tests, with the detailed reference parity map and completion audit tracked in `UPSTREAM.md`.

## Complete CLI Flow

This is a complete workflow using prompts, forms, output, and status helpers from `@ollin/console`.

```ts
import { form, progress, table, task } from '@ollin/console';

const responses = await form()
	.intro('Create a release')
	.text({ message: 'Release name', required: true }, 'name')
	.select(
		{
			message: 'Channel',
			options: ['stable', 'beta', 'nightly'],
			default: 'stable',
		},
		'channel',
	)
	.multiselect(
		{
			message: 'Checks to run',
			options: ['typecheck', 'build', 'smoke'],
			default: ['typecheck', 'build'],
			required: true,
		},
		'checks',
	)
	.confirm({ message: 'Publish after checks pass?', default: false }, 'publish')
	.submit();

table(['Field', 'Value'], [
	['Name', String(responses.name)],
	['Channel', String(responses.channel)],
	['Publish', String(responses.publish)],
]);

await progress('Running checks', responses.checks as string[], async (check) => String(check).toUpperCase());

await task('Finalising release', async (logger) => {
	logger.info('Writing release metadata');
	logger.success('Release workflow complete');
});
```

The same helpers can be used one at a time, chained in `form()`, or wrapped with a custom `PromptEnvironment` for tests and non-standard runtimes.

## Consumer Call And Output

```ts
import { confirm, text } from '@ollin/console';

const release = await text({ message: 'Release name', required: true });
const publish = await confirm({ message: 'Publish now?', default: false });
```

<TerminalOutput :lines='["? Release name","  v1.0.0","? Publish now?","  No"]' />
