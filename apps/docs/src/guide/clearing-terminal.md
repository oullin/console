# Clearing the Terminal

Use `clear` to clear the configured prompt output.

```ts
import { clear } from '@ollin/console';

clear();
```

The package also exports lower-level helpers such as `clearTerminal`, `eraseLine`, and `erasePreviousLines` for direct terminal behaviour.

```ts
import { clearTerminal } from '@ollin/console';

clearTerminal();
```

## When To Use It

Use `clear` sparingly for full-screen command flows where previous output would distract from the current step. For status renderers, prefer `spin`, `progress`, `task`, or `stream`; they handle their own redraw cleanup.

## Complete Usage

```ts
import { clear, clearTerminal, eraseLine, erasePreviousLines, form } from '@ollin/console';

clear();
clearTerminal();
eraseLine();
erasePreviousLines(2);

const responses = await form().clear('clearStep').text({ message: 'Continue with command?', default: 'yes' }, 'continue').submit();

void responses;
```

## Behaviour

`clear` and `clearTerminal` write terminal control sequences. `eraseLine` clears the current line, and `erasePreviousLines` removes a known number of previously rendered lines.

## Consumer Call And Output

```ts
import { clear, info } from '@ollin/console';

clear();
info('Fresh screen ready.');
```

<TerminalOutput :lines='["Fresh screen ready."]' />
