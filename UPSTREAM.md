# Reference Parity Map

Target reference release: `v0.3.18`

Tree: `a19af51bb144bf87f08397921fa619f85c7d4e72`

This port keeps reference behavior as the source of truth while using idiomatic
TypeScript and OpenTUI internals.

## Implemented In Phase 1

| Reference area | TypeScript area |
| --- | --- |
| Helper functions | `packages/tui/src/index.ts` |
| Prompt lifecycle and fallback behavior | `packages/tui/src/prompt.ts`, `packages/tui/src/environment.ts`, `packages/tui/src/environment/*` |
| Key constants and event mapping | `packages/tui/src/key.ts`, `packages/tui/src/key/*` |
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
| Progress boxed frame rendering and formatted fractions | `packages/tui/src/status/progress/render.ts`, `packages/tui/src/theme/box.ts` |
| ANSI, wrapping, truncation, Unicode width | `packages/tui/src/strings.ts` |
| OpenTUI adapter | `packages/tui/src/opentui.ts` |
| Type contracts | `packages/tui/src/types.ts`, `packages/tui/src/contracts/*` |

## Remaining Exact-Parity Work

The following reference areas still need full line-by-line behavioral mapping in
later phases:

- Autocomplete advanced ghost-text rendering
- Form builder
- Multi-search full rendering and selected-result summary parity
- Multi-select
- Notifications
- Progress signal handling and terminal cleanup parity
- Prompt lifecycle
- Search full rendering and highlighted result label parity
- Spinner
- Stream
- Task
- Terminal
- Textarea
- Default theme
- Feature parity tests

## Documented Deviations

- Console output classes are represented by a TypeScript `PromptEnvironment`.
- Package-manager runtime checks are not applicable to this npm package.
- External validator integration is represented by typed synchronous or asynchronous
  validator callbacks.
- Process-signal spinner behavior is represented by TypeScript timers.
