# Tables

Use `table` or `dataTable` to render tabular output.

```ts
import { dataTable, table } from '@ollin/console';

table(['Name', 'Runtime'], [
	['Prompts', 'TypeScript'],
	['Renderer', 'OpenTUI'],
]);

dataTable({
	headers: ['Name', 'Role'],
	rows: [
		['Ada', 'Admin'],
		['Grace', 'Operator'],
	],
});
```

`dataTable` is a display alias for `table`. For an interactive selectable table, use `datatable`.

```ts
import { datatable } from '@ollin/console';

const selected = await datatable({
	message: 'Select a user',
	headers: ['Name', 'Role'],
	rows: [
		['Ada', 'Admin'],
		['Grace', 'Operator'],
	],
	required: true,
});
```

## Complete Usage

```ts
import { dataTable, datatable, form, grid, table } from '@ollin/console';

table({
	headers: ['Package', 'Purpose'],
	rows: [
		{ Package: '@ollin/console', Purpose: 'Runtime prompts' },
		{ Package: 'docs', Purpose: 'Documentation site' },
	],
});

dataTable(['Helper', 'Kind'], [
	['text', 'prompt'],
	['task', 'status'],
]);

grid(['text', 'select', 'search', 'form', 'task', 'stream'], 60);

const selected = await datatable({
	message: 'Select a package',
	headers: ['Package', 'Purpose'],
	rows: [
		['@ollin/console', 'Runtime prompts'],
		['docs', 'Documentation site'],
	],
	required: true,
});

const responses = await form()
	.table(['Step', 'State'], [['Docs', 'Ready']], 'table')
	.datatable({ message: 'Choose action', rows: [['Build'], ['Preview']], required: true }, 'action')
	.submit();

void [selected, responses];
```

## Consumer Call And Output

```ts
import { table } from '@ollin/console';

table(['Package', 'Purpose'], [
	['@ollin/console', 'Prompts'],
	['docs', 'Documentation'],
]);
```

<TerminalOutput :lines='["Package     Purpose","@ollin/console  Prompts","docs        Documentation"]' />
