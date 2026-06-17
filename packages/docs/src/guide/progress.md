# Progress Bar

The `progress` helper supports iterable work and manual progress control.

```ts
import { progress } from '@ollin/tui';

await progress('Processing files', ['one.ts', 'two.ts'], async (file) => file.toUpperCase());
```

For manual control, create a `Progress` instance and call `start`, `advance`, and `finish`.

```ts
import { progress } from '@ollin/tui';

const bar = progress(3, 'Manual steps');

bar.start();
bar.advance();
bar.finish();
```

## Complete Usage

```ts
import { form, progress } from '@ollin/tui';

const files = await progress('Processing files', ['one.ts', 'two.ts'], async (file, bar) => {
	bar.hint(`Current file: ${String(file)}`);

	return String(file).toUpperCase();
});

const bar = progress(3, 'Manual steps');

bar.start();
bar.advance();
bar.label('Almost done');
bar.advance(2);
bar.finish();

const responses = await form().progress('Form progress', ['docs', 'api'], async (step) => String(step), '', 'steps').submit();

void [files, responses];
```

## Consumer Call And Output

```ts
import { progress } from '@ollin/tui';

await progress('Building packages', ['tui', 'docs'], async (pkg) => String(pkg));
```

<TerminalOutput
	:delay="620"
	:frames='[
		["Building packages", "[░░░░░░░░░░] 0 / 2"],
		["Building packages", "[█████░░░░░] 1 / 2"],
		["Building packages", "[██████████] 2 / 2 complete"]
	]'
/>
