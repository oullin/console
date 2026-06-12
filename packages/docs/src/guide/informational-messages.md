# Informational Messages

Use informational helpers for durable terminal messages that are not prompts.

```ts
import { alert, error, info, intro, note, outro, warning } from '@ollin/tui';

intro('Deployment');
info('Preparing release artefacts.');
warning('Two optional checks were skipped.');
error('A required check failed.');
alert('Manual review required.');
note('Use output helpers for durable terminal messages.', 'info');
outro('Done');
```

These helpers write to the configured prompt output. In tests, configure a memory output and assert against the captured text.

## Complete Usage

```ts
import { alert, error, form, info, intro, note, outro, warning } from '@ollin/tui';

intro('Deployment');
info('Preparing release artefacts.');
warning('Two optional checks were skipped.');
error('A required check failed.');
alert('Manual review required.');
note('Use notes for longer terminal messages.', 'info');
outro('Done');

await form()
	.info('Fetching workspace metadata')
	.warning('Using local defaults')
	.note('Review the generated files before publishing.', 'info')
	.submit();
```

## Consumer Call And Output

```ts
import { info, intro, outro, warning } from '@ollin/tui';

intro('Release');
info('Preparing release artefacts.');
warning('Using local defaults.');
outro('Ready');
```

<TerminalOutput :lines='["Release","Preparing release artefacts.","Using local defaults.","Ready"]' />
