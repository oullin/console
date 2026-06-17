# Installation

Install the package from the workspace or package registry that contains `@ollin/console`.

```sh
pnpm add @ollin/console
```

Then import helpers from the public package entrypoint.

```ts
import { text } from '@ollin/console';

const name = await text({
	message: 'What is your name?',
	required: true,
});
```

The package is ESM-first. The workspace acceptance tests verify that the built root entrypoint can be consumed through ESM package resolution.

## Local Workspace

Inside this repository, `@ollin/console` is a workspace package. The docs package depends on it with `workspace:*`, so examples compile against the package source.

## Common Imports

Import only the helpers your command needs.

```ts
import {
	confirm,
	createMemoryOutput,
	createScriptedInput,
	form,
	multiselect,
	progress,
	search,
	select,
	spin,
	table,
	task,
	text,
	withPromptEnvironment,
} from '@ollin/console';

const project = await text({ message: 'Project name', required: true });
const runtime = await select({ message: 'Runtime', options: ['Node.js', 'Bun', 'Deno'] });
const features = await multiselect({ message: 'Features', options: ['docs', 'tests', 'release'], required: true });

if (await confirm({ message: 'Create project?', default: true })) {
	await spin('Scaffolding project', async () => project);
	await progress('Enabling features', features, async (feature) => String(feature));
	await task('Writing summary', async (logger) => logger.success(`Created ${project} for ${runtime}`));
}

table(['Project', 'Runtime'], [[project, runtime]]);

const output = createMemoryOutput();
const input = createScriptedInput(['Ada']);

await withPromptEnvironment({ input, output }, () => search({ message: 'Owner', options: ['Ada', 'Grace'] }));
```

## Consumer Call And Output

```ts
import { text } from '@ollin/console';

const project = await text({ message: 'Project name', required: true });
```

<TerminalOutput :lines='["? Project name","  ollin-console"]' />
