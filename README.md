# `@ollin/tui`

An idiomatic TypeScript/OpenTUI prompt toolkit.

This repository targets behavioral parity with reference prompt toolkit release
`v0.3.18` while using TypeScript-first modules and package boundaries.

## Status

The current codebase is a TypeScript ESM package with the public `@ollin/tui`
entrypoint exporting prompts, form composition, output helpers, status
indicators, terminal utilities, OpenTUI adapter wiring, and deterministic prompt
environment helpers.

Local test suites cover prompt behavior, form flows, output and status helpers,
terminal and string utilities, key handling, typed-value editing, and package
consumption through `packages/acceptance`. The docs package builds a VitePress
guide plus generated API reference. Reference parity and the completion audit are
tracked in `UPSTREAM.md`.

## Development

```sh
pnpm install
pnpm typecheck
pnpm test
```
