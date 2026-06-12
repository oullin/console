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
| Prompt cancellation callback lifecycle | `packages/tui/src/prompt/cancel.ts`, `packages/tui/tests/prompt.test.ts` |
| Prompt revert rejection lifecycle | `packages/tui/src/prompt/revert.ts`, `packages/tui/src/form/builder/revert.ts`, `packages/tui/src/prompts/select/read-confirm.ts`, `packages/tui/tests/form.test.ts` |
| Prompt validation retry default lifecycle | `packages/tui/src/prompt/lifecycle.ts`, `packages/tui/tests/text.test.ts` |
| Prompt post-validation submitted-frame lifecycle | `packages/tui/src/prompt/lifecycle.ts`, `packages/tui/src/prompts/text.ts`, `packages/tui/src/prompts/number.ts`, `packages/tui/tests/text.test.ts`, `packages/tui/tests/number.test.ts` |
| Prompt non-interactive transform lifecycle before validation | `packages/tui/src/prompt/lifecycle.ts`, `packages/tui/tests/text.test.ts`, `packages/tui/tests/number.test.ts`, `packages/tui/tests/choices.test.ts`, `packages/tui/tests/search.test.ts` |
| Prompt validation error styling | `packages/tui/src/theme.ts`, `packages/tui/tests/prompt.test.ts` |
| Key constants and event mapping | `packages/tui/src/key.ts`, `packages/tui/src/key/*` |
| Terminal helpers | `packages/tui/src/terminal.ts` |
| Text input | `packages/tui/src/prompts/text.ts`, `packages/tui/src/typed-value.ts` |
| Text input defaults, transforms, validation, editing keys, non-interactive behavior, and failed reads | `packages/tui/src/prompts/text.ts`, `packages/tui/src/prompt/lifecycle.ts`, `packages/tui/src/typed-value.ts`, `packages/tui/tests/text.test.ts` |
| Text active, submitted, cancelled, placeholder, and validation-safe rendering | `packages/tui/src/prompts/text.ts`, `packages/tui/src/typed-value.ts`, `packages/tui/src/typed-value/render.ts`, `packages/tui/tests/text.test.ts` |
| Textarea input | `packages/tui/src/prompts/textarea.ts`, `packages/tui/src/typed-value.ts` |
| Textarea defaults, transforms, validation, editing keys, line navigation, and non-interactive behavior | `packages/tui/src/prompts/textarea.ts`, `packages/tui/src/prompt/lifecycle.ts`, `packages/tui/src/typed-value.ts`, `packages/tui/tests/textarea.test.ts` |
| Textarea active, submitted, cancelled, scrollbar, placeholder, and validation-safe rendering | `packages/tui/src/prompts/textarea.ts`, `packages/tui/src/typed-value.ts`, `packages/tui/src/typed-value/textarea-frame.ts`, `packages/tui/tests/textarea.test.ts` |
| Textarea control-key line navigation and empty-line movement | `packages/tui/src/typed-value/edit/navigation.ts`, `packages/tui/tests/textarea.test.ts` |
| Textarea boxed renderer and placeholder styling | `packages/tui/src/typed-value/textarea-frame.ts`, `packages/tui/tests/textarea.test.ts` |
| Textarea scrollbar rendering | `packages/tui/src/typed-value/textarea-frame.ts`, `packages/tui/src/typed-value/lines.ts`, `packages/tui/tests/textarea.test.ts` |
| Textarea wrapped frame line windows | `packages/tui/src/typed-value/textarea-frame.ts`, `packages/tui/src/typed-value/lines.ts`, `packages/tui/tests/textarea.test.ts`, `packages/tui/tests/typed-value.test.ts` |
| Textarea wrapped-line cursor navigation | `packages/tui/src/typed-value.ts`, `packages/tui/src/typed-value/edit.ts`, `packages/tui/src/typed-value/edit/navigation.ts`, `packages/tui/src/typed-value/lines.ts`, `packages/tui/tests/textarea.test.ts`, `packages/tui/tests/typed-value.test.ts` |
| Password input | `packages/tui/src/prompts/password.ts`, `packages/tui/src/typed-value.ts` |
| Password input transforms, validation retry, editing keys, cancellation, masking, and non-interactive behavior | `packages/tui/src/prompts/password.ts`, `packages/tui/src/prompts/password/input.ts`, `packages/tui/src/prompt/lifecycle.ts`, `packages/tui/tests/password.test.ts` |
| Password active, submitted, cancelled, placeholder, masked, and validation-safe rendering | `packages/tui/src/prompts/password.ts`, `packages/tui/src/prompts/password/input.ts`, `packages/tui/src/prompts/password/render.ts`, `packages/tui/tests/password.test.ts` |
| Number input | `packages/tui/src/prompts/number.ts`, `packages/tui/src/typed-value.ts` |
| Number active, submitted, cancelled, arrow, placeholder, default, and validation-safe rendering | `packages/tui/src/prompts/number.ts`, `packages/tui/src/prompts/number/input.ts`, `packages/tui/src/prompts/number/render.ts`, `packages/tui/tests/number.test.ts` |
| Confirm, select, multiselect | `packages/tui/src/prompts/select/*` |
| Confirm active, submitted, cancelled, custom-label, fallback, and non-interactive behavior | `packages/tui/src/prompts/select/read-confirm.ts`, `packages/tui/src/prompts/select/render-confirm.ts`, `packages/tui/tests/choices.test.ts` |
| Confirm submitted frame renders only after validation passes | `packages/tui/src/prompts/select/confirm.ts`, `packages/tui/src/prompts/select/read-confirm.ts`, `packages/tui/tests/choices.test.ts` |
| Select active boxed layout and row styling | `packages/tui/src/prompts/select/render.ts`, `packages/tui/tests/choices.test.ts` |
| Select and multi-select label-first helper argument surface with info | `packages/tui/src/prompts/select/index.ts`, `packages/tui/tests/choices.test.ts` |
| Select required-option validation | `packages/tui/src/prompts/select/validators/options.ts`, `packages/tui/src/prompts/select/index.ts`, `packages/tui/tests/choices.test.ts` |
| Select non-interactive default validation | `packages/tui/src/prompts/select/index.ts`, `packages/tui/tests/choices.test.ts` |
| Select line-mode and exhausted-input default fallback with validation retry | `packages/tui/src/prompts/select/index.ts`, `packages/tui/src/prompts/select/read-selected.ts`, `packages/tui/tests/choices.test.ts` |
| Select submitted final frame | `packages/tui/src/prompts/select/render.ts`, `packages/tui/src/prompts/select/read-selected.ts`, `packages/tui/tests/choices.test.ts` |
| Select submitted frame renders only after validation passes | `packages/tui/src/prompts/select/index.ts`, `packages/tui/src/prompts/select/read-selected.ts`, `packages/tui/tests/choices.test.ts` |
| Select cancel final frame | `packages/tui/src/prompts/select/render.ts`, `packages/tui/src/prompts/select/read-selected.ts`, `packages/tui/tests/choices.test.ts` |
| Multi-select active boxed layout and row styling | `packages/tui/src/prompts/select/render.ts`, `packages/tui/tests/choices.test.ts` |
| Multi-select submitted final frame | `packages/tui/src/prompts/select/render.ts`, `packages/tui/src/prompts/select/read-multiple.ts`, `packages/tui/tests/choices.test.ts` |
| Multi-select submitted frame renders only after validation passes | `packages/tui/src/prompts/select/index.ts`, `packages/tui/src/prompts/select/read-multiple.ts`, `packages/tui/tests/choices.test.ts` |
| Multi-select cancel final frame | `packages/tui/src/prompts/select/render.ts`, `packages/tui/src/prompts/select/read-multiple.ts`, `packages/tui/tests/choices.test.ts` |
| Suggest, autocomplete | `packages/tui/src/prompts/suggest/*` |
| Suggest active, submitted, cancelled, placeholder, info, scrolling, and validation-safe rendering | `packages/tui/src/prompts/suggest/index.ts`, `packages/tui/src/prompts/suggest/read.ts`, `packages/tui/src/prompts/suggest/render.ts`, `packages/tui/tests/suggest.test.ts` |
| Suggest and autocomplete label-first info rendering | `packages/tui/src/prompts/suggest/index.ts`, `packages/tui/src/prompts/suggest/options.ts`, `packages/tui/src/prompts/suggest/read-autocomplete.ts`, `packages/tui/src/prompts/suggest/render-autocomplete.ts`, `packages/tui/tests/suggest.test.ts` |
| Autocomplete styled cursor-aware ghost text and Unicode-safe completion acceptance | `packages/tui/src/prompts/suggest/ghost-text.ts`, `packages/tui/src/prompts/suggest/autocomplete.ts`, `packages/tui/src/theme/styles.ts`, `packages/tui/tests/suggest.test.ts` |
| Autocomplete active, submitted, cancelled, placeholder, ghost-text, and validation-safe rendering | `packages/tui/src/prompts/suggest/index.ts`, `packages/tui/src/prompts/suggest/read-autocomplete.ts`, `packages/tui/src/prompts/suggest/render-autocomplete.ts`, `packages/tui/tests/suggest.test.ts` |
| Search, multisearch | `packages/tui/src/prompts/search/*` |
| Search and multi-search label-first helper argument surface with info | `packages/tui/src/prompts/search/index.ts`, `packages/tui/tests/search.test.ts` |
| Search active boxed layout and row styling | `packages/tui/src/prompts/search/render.ts`, `packages/tui/tests/search.test.ts` |
| Search and multisearch empty-result rendering | `packages/tui/src/prompts/search/render.ts`, `packages/tui/tests/search.test.ts` |
| Search highlighted-result row styling | `packages/tui/src/prompts/search/render.ts`, `packages/tui/src/theme/styles.ts`, `packages/tui/tests/search.test.ts` |
| Search submitted final frame | `packages/tui/src/prompts/search/render.ts`, `packages/tui/src/prompts/search/read-single.ts`, `packages/tui/tests/search.test.ts` |
| Search submitted frame renders only after validation passes | `packages/tui/src/prompts/search/index.ts`, `packages/tui/src/prompts/search/read-single.ts`, `packages/tui/src/prompts/search/read-single/result.ts`, `packages/tui/tests/search.test.ts` |
| Search cancel final frame | `packages/tui/src/prompts/search/render.ts`, `packages/tui/src/prompts/search/read-single.ts`, `packages/tui/tests/search.test.ts` |
| Multi-search active boxed layout and selected-count footer | `packages/tui/src/prompts/search/render.ts`, `packages/tui/tests/search.test.ts` |
| Multi-search submitted final frame | `packages/tui/src/prompts/search/render.ts`, `packages/tui/src/prompts/search/read-multi.ts`, `packages/tui/tests/search.test.ts` |
| Multi-search submitted frame renders only after validation passes | `packages/tui/src/prompts/search/index.ts`, `packages/tui/src/prompts/search/read-multi.ts`, `packages/tui/src/prompts/search/read-multi/result.ts`, `packages/tui/tests/search.test.ts` |
| Multi-search cancel final frame | `packages/tui/src/prompts/search/render.ts`, `packages/tui/src/prompts/search/read-multi.ts`, `packages/tui/tests/search.test.ts` |
| Pause | `packages/tui/src/prompts/pause.ts` |
| Pause themed key-driven frame | `packages/tui/src/prompts/pause.ts`, `packages/tui/src/prompts/pause/render.ts`, `packages/tui/tests/pause.test.ts` |
| Pause non-interactive no-render behavior | `packages/tui/src/prompts/pause.ts`, `packages/tui/tests/pause.test.ts` |
| Choice normalization, matching, navigation, and list rendering concerns | `packages/tui/src/concerns/choices.ts` |
| Choice and search scrollbar rendering | `packages/tui/src/concerns/scrollbar.ts`, `packages/tui/src/concerns/choices.ts`, `packages/tui/src/prompts/search/render.ts` |
| Form builder | `packages/tui/src/form.ts`, `packages/tui/src/form/builder/*` |
| Form builder nested prompt revert short-circuiting | `packages/tui/src/form/builder/revert.ts`, `packages/tui/src/form/builder/submit.ts`, `packages/tui/tests/form.test.ts` |
| Form builder first-step and conditional revert feature coverage | `packages/tui/src/form/builder/conditions.ts`, `packages/tui/src/form/builder/submit.ts`, `packages/tui/tests/form.test.ts` |
| Form builder asynchronous condition lifecycle | `packages/tui/src/form/builder/conditions.ts`, `packages/tui/src/form/builder/submit.ts`, `packages/tui/src/form/types.ts`, `packages/tui/tests/form.test.ts` |
| Notes and alert-style output | `packages/tui/src/output/notes.ts` |
| Note multiline and typed theme rendering | `packages/tui/src/output/notes.ts`, `packages/tui/src/theme/styles.ts`, `packages/tui/tests/output.test.ts` |
| Note intro/outro visible-width padding | `packages/tui/src/output/notes.ts`, `packages/tui/tests/output.test.ts` |
| Native notifications | `packages/tui/src/output/notify.ts` |
| Notification command construction, executable discovery, and process result reporting | `packages/tui/src/output/notify.ts`, `packages/tui/src/output/notify/*` |
| Tables, data tables, and grids | `packages/tui/src/output/table.ts`, `packages/tui/src/output/data-table.ts` |
| Data table label-first helper argument surface | `packages/tui/src/output/data-table.ts`, `packages/tui/tests/table.test.ts` |
| Data table transform callback lifecycle | `packages/tui/src/contracts/output.ts`, `packages/tui/src/output/data-table.ts`, `packages/tui/tests/table.test.ts` |
| Data table interactive default selection | `packages/tui/src/output/data-table/read.ts`, `packages/tui/tests/table.test.ts` |
| Data table exhausted-input default selection | `packages/tui/src/output/data-table/read.ts`, `packages/tui/tests/table.test.ts` |
| Data table no-results search rendering | `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Data table viewing-info rendering | `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Data table submitted and cancelled final frames | `packages/tui/src/output/data-table/render.ts`, `packages/tui/src/output/data-table/read.ts`, `packages/tui/tests/table.test.ts` |
| Data table submitted frame renders only after validation passes | `packages/tui/src/output/data-table.ts`, `packages/tui/src/output/data-table/read.ts`, `packages/tui/src/output/data-table/types.ts`, `packages/tui/tests/table.test.ts` |
| Data table themed cancellation warning | `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Data table multiline cell rendering | `packages/tui/src/output/data-table/multiline.ts`, `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Data table scrollbar rendering | `packages/tui/src/output/data-table/scrollbar.ts`, `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Data table no-header and blank-cell rendering | `packages/tui/src/output/data-table/render.ts`, `packages/tui/src/output/data-table/rows.ts`, `packages/tui/tests/table.test.ts` |
| Data table row-shape validation and normalization | `packages/tui/src/output/validators/data-table.ts`, `packages/tui/src/output/data-table/rows.ts`, `packages/tui/tests/table.test.ts` |
| Static table row-shape validation and header inference | `packages/tui/src/output/validators/table.ts`, `packages/tui/tests/table.test.ts` |
| Data table fixed visual height | `packages/tui/src/output/data-table/visual-window.ts`, `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Data table comfortable width and outlier truncation | `packages/tui/src/output/data-table/widths.ts`, `packages/tui/src/output/data-table/render.ts`, `packages/tui/tests/table.test.ts` |
| Boxed balanced grid rendering | `packages/tui/src/output/grid.ts`, `packages/tui/tests/output.test.ts` |
| Terminal title and clear output | `packages/tui/src/output/terminal.ts` |
| Spinner, progress, task, stream | `packages/tui/src/status/*`, `packages/tui/src/status.ts` |
| Form builder label-first search and multisearch methods | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/tests/form.test.ts` |
| Form builder label-first choice and search info rendering | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/src/form/builder/prompts/contracts/choices.ts`, `packages/tui/tests/form.test.ts` |
| Form builder previous-response defaults | `packages/tui/src/form/builder/previous.ts`, `packages/tui/src/form/builder/validators/previous.ts`, `packages/tui/tests/form.test.ts` |
| Form builder basic prompt object-option method surface | `packages/tui/src/form/builder/prompts/basic.ts`, `packages/tui/src/form/builder/prompts/contracts/basic.ts`, `packages/tui/src/form/builder/prompts/validators/basic.ts`, `packages/tui/tests/form.test.ts` |
| Form builder choice prompt object-option method surface | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/src/form/builder/prompts/contracts/choices.ts`, `packages/tui/src/form/builder/prompts/validators/select.ts`, `packages/tui/tests/form.test.ts` |
| Form builder suggest and autocomplete placeholder/default arguments | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/src/form/builder/prompts/contracts/choices.ts`, `packages/tui/tests/form.test.ts` |
| Form builder suggest and autocomplete object-option method surface | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/src/form/builder/prompts/contracts/choices.ts`, `packages/tui/src/form/builder/prompts/validators/suggest.ts`, `packages/tui/tests/form.test.ts` |
| Form builder suggest and autocomplete label-first info rendering | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/src/form/builder/prompts/contracts/choices.ts`, `packages/tui/tests/form.test.ts` |
| Form builder number transform argument surface | `packages/tui/src/form/builder/prompts/basic.ts`, `packages/tui/src/form/builder/prompts/contracts/basic.ts`, `packages/tui/src/prompts/number.ts`, `packages/tui/tests/form.test.ts`, `packages/tui/tests/number.test.ts` |
| Form builder password previous-response defaults | `packages/tui/src/form/builder/prompts/basic.ts`, `packages/tui/tests/form.test.ts` |
| Form builder search and multisearch previous-response defaults | `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/tests/form.test.ts` |
| Form builder named prompt defaults after skipped conditional responses | `packages/tui/src/form/builder/previous.ts`, `packages/tui/src/form/builder/prompts/choices.ts`, `packages/tui/src/form/builder/validators/previous.ts`, `packages/tui/tests/form.test.ts` |
| Form builder label-first data table method surface | `packages/tui/src/form/builder/output.ts`, `packages/tui/tests/form.test.ts` |
| Form builder label-first data table previous-response defaults | `packages/tui/src/form/builder/output.ts`, `packages/tui/tests/form.test.ts` |
| Form builder interactive data table object-option method surface | `packages/tui/src/form/builder/output.ts`, `packages/tui/src/output/validators/data-table.ts`, `packages/tui/tests/form.test.ts` |
| Form builder object-option table output method surface | `packages/tui/src/form/builder/output.ts`, `packages/tui/src/output/validators/table.ts`, `packages/tui/tests/form.test.ts` |
| Form builder output method surface for grid, display data table, terminal helpers, and notifications | `packages/tui/src/form/builder/index.ts`, `packages/tui/src/form/builder/output.ts`, `packages/tui/tests/form.test.ts` |
| Display-only output helper return values and form responses | `packages/tui/src/output/notes.ts`, `packages/tui/src/output/table.ts`, `packages/tui/src/form/builder/output.ts`, `packages/tui/tests/output.test.ts`, `packages/tui/tests/form.test.ts` |
| Progress boxed frame rendering and formatted fractions | `packages/tui/src/status/progress/render.ts`, `packages/tui/src/theme/box.ts` |
| Spinner static and deterministic animated frame rendering | `packages/tui/src/status/spinner.ts`, `packages/tui/src/status/spinner/render.ts` |
| Spinner empty default message | `packages/tui/src/status/spinner.ts`, `packages/tui/src/form/builder/status.ts`, `packages/tui/tests/spinner.test.ts`, `packages/tui/tests/form.test.ts` |
| Task static and deterministic animated frame rendering, bounded logs, and stable summary symbols | `packages/tui/src/status/task.ts`, `packages/tui/src/status/task/*` |
| Form builder root-aligned spinner and task overloads | `packages/tui/src/form/builder/status.ts`, `packages/tui/tests/form.test.ts` |
| Form builder root-aligned manual progress overload | `packages/tui/src/form/builder/status.ts`, `packages/tui/tests/form.test.ts` |
| Task process output capture | `packages/tui/src/status/task/process-output.ts`, `packages/tui/tests/task.test.ts` |
| Stream frame rendering, wrapping, fade styles, and close flushing | `packages/tui/src/status/stream.ts`, `packages/tui/src/status/stream/*` |
| Form builder root-aligned manual stream overload | `packages/tui/src/form/builder/status.ts`, `packages/tui/tests/form.test.ts` |
| Status cursor visibility cleanup | `packages/tui/src/status/spinner.ts`, `packages/tui/src/status/stream.ts`, `packages/tui/src/status/task.ts` |
| Status rendered-frame cleanup | `packages/tui/src/status/frame.ts`, `packages/tui/src/status/spinner.ts`, `packages/tui/src/status/task.ts` |
| Progress cursor visibility and rendered-frame redraw cleanup | `packages/tui/src/status/progress.ts`, `packages/tui/src/status/frame.ts` |
| Progress signal cleanup | `packages/tui/src/status/progress.ts`, `packages/tui/tests/progress.test.ts` |
| Terminal clear/title, cursor visibility, true-color detection, default colors, and raw input restoration | `packages/tui/src/terminal.ts`, `packages/tui/src/terminal/*`, `packages/tui/src/environment/raw-key.ts` |
| Terminal clear/title and notification helper return values | `packages/tui/src/output/terminal.ts`, `packages/tui/src/output/notify.ts`, `packages/tui/tests/terminal.test.ts`, `packages/tui/tests/notify.test.ts` |
| Terminal raw key alias normalization | `packages/tui/src/environment/raw-key/normalize.ts`, `packages/tui/tests/environment.test.ts` |
| Terminal split escape-sequence buffering | `packages/tui/src/environment/raw-key.ts`, `packages/tui/src/environment/raw-key/normalize.ts`, `packages/tui/tests/environment.test.ts` |
| Red, strikethrough, and border-styled frames | `packages/tui/src/theme/styles.ts`, `packages/tui/src/theme/box.ts` |
| ANSI segment parsing, ANSI-aware wrapping, truncation, Unicode width | `packages/tui/src/strings.ts`, `packages/tui/tests/strings.test.ts` |
| ANSI truncation style cleanup and visible-width markers | `packages/tui/src/strings.ts`, `packages/tui/tests/strings.test.ts` |
| Key-mode search default submission | `packages/tui/src/prompts/search/read-single.ts`, `packages/tui/src/prompts/search/read-single/result.ts`, `packages/tui/tests/search.test.ts` |
| OpenTUI adapter | `packages/tui/src/opentui.ts` |
| Type contracts | `packages/tui/src/types.ts`, `packages/tui/src/contracts/*` |
| Public ESM package runtime and type-consumption surface | `packages/tui/src/index.ts`, `packages/tui/src/form/builder/index.ts`, `packages/tui/src/output/notify.ts`, `packages/tui/src/output/notify/*`, `packages/acceptance/tests/package.test.ts` |
| Data table prompt argument validation layer | `packages/tui/src/output/validators/data-table.ts`, `packages/tui/src/output/data-table.ts`, `packages/tui/tests/table.test.ts` |
| Table row cell normalization validation layer | `packages/tui/src/output/validators/table.ts`, `packages/tui/src/output/table.ts`, `packages/tui/tests/table.test.ts` |
| Choice option shape validation layer | `packages/tui/src/concerns/validators/choice.ts`, `packages/tui/src/concerns/choices.ts`, `packages/tui/tests/choices.test.ts` |
| Required value validation layer | `packages/tui/src/validators/required.ts`, `packages/tui/tests/prompt.test.ts` |

## Remaining Exact-Parity Work

The following reference areas still need full line-by-line behavioral mapping in
later phases:

- Form builder remaining method-surface and validation parity
- Prompt lifecycle
- Default theme
- Feature parity tests

## Documented Deviations

- Console output classes are represented by a TypeScript `PromptEnvironment`.
- Package-manager runtime checks are not applicable to this npm package.
- External validator integration is represented by typed synchronous or asynchronous
  validator callbacks.
- Process-signal spinner behavior is represented by TypeScript timers.
