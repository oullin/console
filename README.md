# `@ollin/tui`

An idiomatic TypeScript/OpenTUI prompt toolkit.

This repository targets behavioral parity with reference prompt toolkit release
`v0.3.18` while using TypeScript-first modules and package boundaries.

## Status

The port is being delivered phase by phase on one draft PR. Current code includes
working key-driven text and choice prompts, output helpers, terminal utilities,
OpenTUI adapter wiring, and local parity tests. Full reference feature-test parity
is tracked in `UPSTREAM.md`.

## Development

```sh
pnpm install
pnpm typecheck
pnpm test
```
