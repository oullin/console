# Pause

The `pause` helper waits for the user to continue.

```ts
import { pause } from '@ollin/console';

await pause('Press enter to continue.');
```

Use `pause` between groups of prompts or before a destructive step that should be reviewed by the user.

`pause` is also available on `form()`.

```ts
import { form } from '@ollin/console';

await form().pause('Review the summary before continuing.').submit();
```

## Return Value

`pause` resolves to `true` after a user continues in an interactive environment. In a non-interactive environment it resolves to `false`, so command code can skip interactive-only review screens.

## Complete Usage

```ts
import { form, pause } from '@ollin/console';

const continued = await pause('Press enter to continue.');

const responses = await form()
	.text({ message: 'Release name', required: true }, 'name')
	.pause('Review the release name before continuing.')
	.confirm({ message: 'Publish?', default: false }, 'publish')
	.submit();

void [continued, responses];
```

## Consumer Call And Output

```ts
import { pause } from '@ollin/console';

await pause('Review the summary, then press enter.');
```

<TerminalOutput :lines='["? Review the summary, then press enter."]' />
