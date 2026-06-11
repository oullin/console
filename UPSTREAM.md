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
| Textarea control-key line navigation and empty-line movement | `packages/tui/src/typed-value/edit/navigation.ts`, `packages/tui/tests/textarea.test.ts` |
| Password input | `packages/tui/src/prompts/password.ts`, `packages/tui/src/typed-value.ts` |
| Number input | `packages/tui/src/prompts/number.ts`, `packages/tui/src/typed-value.ts` |
| Confirm, select, multiselect | `packages/tui/src/prompts/select/*` |
| Multi-select checklist markers | `packages/tui/src/concerns/choices.ts`, `packages/tui/src/prompts/select/render.ts`, `packages/tui/tests/choices.test.ts` |
| Suggest, autocomplete | `packages/tui/src/prompts/suggest/*` |
| Autocomplete styled cursor-aware ghost text and Unicode-safe completion acceptance | `packages/tui/src/prompts/suggest/ghost-text.ts`, `packages/tui/src/prompts/suggest/autocomplete.ts`, `packages/tui/src/theme/styles.ts`, `packages/tui/tests/suggest.test.ts` |
| Search, multisearch | `packages/tui/src/prompts/search/*` |
| Search and multisearch empty-result rendering | `packages/tui/src/prompts/search/render.ts`, `packages/tui/tests/search.test.ts` |
| Pause | `packages/tui/src/prompts/pause.ts` |
| Choice normalization, matching, navigation, and list rendering concerns | `packages/tui/src/concerns/choices.ts` |
| Form builder | `packages/tui/src/form.ts`, `packages/tui/src/form/builder/*` |
| Notes and alert-style output | `packages/tui/src/output/notes.ts` |
| Native notifications | `packages/tui/src/output/notify.ts` |
| Notification command construction, executable discovery, and process result reporting | `packages/tui/src/output/notify.ts`, `packages/tui/src/output/notify/*` |
| Tables, data tables, and grids | `packages/tui/src/output/table.ts`, `packages/tui/src/output/data-table.ts` |
| Terminal title and clear output | `packages/tui/src/output/terminal.ts` |
| Spinner, progress, task, stream | `packages/tui/src/status/*`, `packages/tui/src/status.ts` |
| Progress boxed frame rendering and formatted fractions | `packages/tui/src/status/progress/render.ts`, `packages/tui/src/theme/box.ts` |
| Spinner static and deterministic animated frame rendering | `packages/tui/src/status/spinner.ts`, `packages/tui/src/status/spinner/render.ts` |
| Task static and deterministic animated frame rendering, bounded logs, and stable summary symbols | `packages/tui/src/status/task.ts`, `packages/tui/src/status/task/*` |
| Stream frame rendering, wrapping, fade styles, and close flushing | `packages/tui/src/status/stream.ts`, `packages/tui/src/status/stream/*` |
| Status cursor visibility cleanup | `packages/tui/src/status/spinner.ts`, `packages/tui/src/status/stream.ts`, `packages/tui/src/status/task.ts` |
| Status rendered-frame cleanup | `packages/tui/src/status/frame.ts`, `packages/tui/src/status/spinner.ts`, `packages/tui/src/status/task.ts` |
| Terminal clear/title, cursor visibility, true-color detection, default colors, and raw input restoration | `packages/tui/src/terminal.ts`, `packages/tui/src/terminal/*`, `packages/tui/src/environment/raw-key.ts` |
| ANSI, wrapping, truncation, Unicode width | `packages/tui/src/strings.ts` |
| OpenTUI adapter | `packages/tui/src/opentui.ts` |
| Type contracts | `packages/tui/src/types.ts`, `packages/tui/src/contracts/*` |

## Remaining Exact-Parity Work

The following reference areas still need full line-by-line behavioral mapping in
later phases:

- Form builder
- Multi-search full rendering and selected-result summary parity
- Multi-select
- Progress signal handling and terminal cleanup parity
- Prompt lifecycle
- Search full rendering and highlighted result label parity
- Task process-log parity
- Terminal interactive read parity
- Textarea boxed renderer, wrapped cursor, and scrollbar parity
- Default theme
- Feature parity tests

## Documented Deviations

- Console output classes are represented by a TypeScript `PromptEnvironment`.
- Package-manager runtime checks are not applicable to this npm package.
- External validator integration is represented by typed synchronous or asynchronous
  validator callbacks.
- Process-signal spinner behavior is represented by TypeScript timers.
