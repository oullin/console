# Available Prompts

`@ollin/tui` provides prompt helpers for text input, choice selection, search flows, confirmation, pausing, and autocomplete.

| Helper | Purpose |
| --- | --- |
| `text` | Read a single-line string. |
| `textarea` | Read multi-line text. |
| `number` | Read numeric input with validation helpers. |
| `password` | Read masked text input. |
| `confirm` | Ask for a boolean decision. |
| `select` | Choose one item from a list. |
| `multiselect` | Choose multiple items from a list. |
| `suggest` | Offer suggestions while still allowing free input. |
| `search` | Resolve one selected item from filtered options. |
| `multisearch` | Resolve multiple selected items from filtered options. |
| `pause` | Wait for the user to continue. |
| `autocomplete` | Complete an input from a known option list. |

Object options use `message` as the visible prompt text. Label-first overloads are available for many helpers when a terse call site is useful.

## Complete Prompt Tour

```ts
import { autocomplete, confirm, multiselect, multisearch, number, password, pause, search, select, suggest, text, textarea } from '@ollin/tui';

const name = await text({ message: 'Name', required: true });
const description = await textarea({ message: 'Description', rows: 4 });
const copies = await number({ message: 'Copies', default: 1, integer: true, min: 1 });
const secret = await password({ message: 'Token', required: true });
const accepted = await confirm({ message: 'Continue?', default: true });
const role = await select({ message: 'Role', options: ['Member', 'Owner'], default: 'Member' });
const permissions = await multiselect({ message: 'Permissions', options: ['Read', 'Write', 'Delete'], default: ['Read'] });
const author = await suggest({ message: 'Author', options: ['Ada', 'Grace', 'Lin'] });
const runtime = await autocomplete({ message: 'Runtime', options: ['Node.js', 'Bun', 'Deno'] });
const user = await search({ message: 'User', options: ['Ada Lovelace', 'Grace Hopper'], required: true });
const reviewers = await multisearch({ message: 'Reviewers', options: ['Ada Lovelace', 'Grace Hopper'], required: true });

await pause('Review your selections, then press enter.');

void [name, description, copies, secret, accepted, role, permissions, author, runtime, user, reviewers];
```

## Consumer Call And Output

```ts
import { confirm, select, text } from '@ollin/tui';

const name = await text({ message: 'Name', required: true });
const template = await select({ message: 'Template', options: ['cli', 'library', 'docs'] });
const install = await confirm({ message: 'Install dependencies?', default: true });
```

<TerminalOutput :lines='["? Name","  release-tool","? Template","  cli","? Install dependencies?","  Yes"]' />
