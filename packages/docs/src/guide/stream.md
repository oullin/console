# Stream

The `stream` helper renders streaming text from an iterable or async iterable.

```ts
import { stream } from '@ollin/tui';

await stream(['Preparing release\n', 'Release ready\n']);
```

Calling `stream()` without a source returns a `Stream` instance for manual writes.

```ts
import { stream } from '@ollin/tui';

const output = stream();

output.write('Preparing release\n');
output.close();
```

## Complete Usage

```ts
import { form, stream } from '@ollin/tui';

await stream(['Preparing release\n', 'Release ready\n']);

const output = stream();

output.write('Writing files\n');
output.append('Done\n');
output.close();

const responses = await form().stream(['Line one\n', 'Line two\n'], 'streamedOutput').submit();

void responses;
```

## Consumer Call And Output

```ts
import { stream } from '@ollin/tui';

await stream(['Preparing release\n', 'Release ready\n']);
```

<TerminalOutput
	:delay="680"
	:frames='[
		["Preparing release"],
		["Preparing release", "Writing manifest"],
		["Preparing release", "Writing manifest", "Release ready"]
	]'
/>
