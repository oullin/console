# Upstream Parity Map

Target upstream release: `v0.3.18`

Tree: `a19af51bb144bf87f08397921fa619f85c7d4e72`

This port keeps upstream behavior as the source of truth while using idiomatic
TypeScript and OpenTUI internals.

## Implemented In Phase 1

| Upstream area | TypeScript area |
| --- | --- |
| `src/helpers.php` | `packages/tui/src/index.ts` |
| Prompt lifecycle and fallback behavior | `packages/tui/src/prompt.ts`, `packages/tui/src/environment.ts`, `packages/tui/src/environment/*` |
| Key constants | `packages/tui/src/key.ts` |
| Terminal helpers | `packages/tui/src/terminal.ts` |
| Text input | `packages/tui/src/prompts/text.ts`, `packages/tui/src/typed-value.ts` |
| Textarea input | `packages/tui/src/prompts/textarea.ts`, `packages/tui/src/typed-value.ts` |
| Password input | `packages/tui/src/prompts/password.ts`, `packages/tui/src/typed-value.ts` |
| Number input | `packages/tui/src/prompts/number.ts`, `packages/tui/src/typed-value.ts` |
| Confirm, select, multiselect | `packages/tui/src/prompts/select/*` |
| Suggest, autocomplete | `packages/tui/src/prompts/suggest/*` |
| Search, multisearch | `packages/tui/src/prompts/search/*` |
| Pause | `packages/tui/src/prompts/pause.ts` |
| Choice normalization, matching, navigation, and list rendering concerns | `packages/tui/src/concerns/choices.ts` |
| Form builder | `packages/tui/src/form.ts`, `packages/tui/src/form/builder/*` |
| Notes and alert-style output | `packages/tui/src/output/notes.ts` |
| Native notifications | `packages/tui/src/output/notify.ts` |
| Tables, data tables, and grids | `packages/tui/src/output/table.ts`, `packages/tui/src/output/data-table.ts` |
| Terminal title and clear output | `packages/tui/src/output/terminal.ts` |
| Spinner, progress, task, stream | `packages/tui/src/status/*`, `packages/tui/src/status.ts` |
| ANSI, wrapping, truncation, Unicode width | `packages/tui/src/strings.ts` |
| OpenTUI adapter | `packages/tui/src/opentui.ts` |

## Remaining Exact-Parity Work

The following upstream files still need full line-by-line behavioral mapping in
later phases:

- `src/AutoCompletePrompt.php` advanced ghost-text rendering
- `src/FormBuilder.php`
- `src/MultiSearchPrompt.php` full rendering and selected-result summary parity
- `src/MultiSelectPrompt.php`
- `src/NotifyPrompt.php`
- `src/Progress.php` exact box drawing and signal handling parity
- `src/Prompt.php`
- `src/SearchPrompt.php` full rendering and highlighted result label parity
- `src/Spinner.php`
- `src/Stream.php`
- `src/Task.php`
- `src/Terminal.php`
- `src/TextareaPrompt.php`
- `src/Themes/Default/*`
- `tests/Feature/*`

## Documented Deviations

- Symfony Console output classes are represented by a TypeScript `PromptEnvironment`.
- Composer runtime checks are not applicable to an npm package.
- PHP validator integration is represented by typed synchronous or asynchronous
  validator callbacks.
- `pcntl` spinner behavior is represented by TypeScript timers.
