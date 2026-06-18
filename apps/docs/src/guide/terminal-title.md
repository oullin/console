# Terminal Title

Use `title` to set the terminal title through the configured prompt output.

```ts
import { title } from '@ollin/console';

title('Ollin TUI');
```

The lower-level terminal helper `setTerminalTitle` is also exported for direct terminal control.

```ts
import { setTerminalTitle } from '@ollin/console';

setTerminalTitle('Ollin TUI');
```

## When To Use It

Use `title` when you want the same output boundary as the rest of the prompt helpers. Use `setTerminalTitle` when lower-level terminal control is more appropriate.

## Complete Usage

```ts
import { form, setTerminalTitle, title } from '@ollin/console';

title('Ollin TUI');
setTerminalTitle('Ollin TUI: Build');

const responses = await form().title('Ollin TUI: Form').text({ message: 'Command', default: 'build' }, 'command').submit();

void responses;
```

## Behaviour

Terminal title support depends on the terminal emulator. Terminals that ignore the title escape sequence do not affect the rest of the command.

## Consumer Call And Output

```ts
import { title } from '@ollin/console';

title('Ollin TUI: Release');
```

<TerminalOutput :lines='["Terminal title: Ollin TUI: Release"]' />
