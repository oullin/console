# Infra Workspace

The `infra` workspace (`@ollin/console-infra`) owns project tooling that is not part of
the public package runtime:

- `src` exposes shared TypeScript path helpers (`infraRoot`, `cacheDir`,
  `workspacePath`, …) for the tool cache.
- `tsconfig` holds the centralized TypeScript configs every package extends
  (`base.json`, `console.json`, `tests.json`), published via the
  `@ollin/console-infra/tsconfig/*.json` exports.
- `make` holds the modular Makefile. The repo-root `Makefile` is a transparent
  forwarder into `infra/make/Makefile`.
- `.cache` is the only mutable tool-cache root for workspace commands.

Cache buckets are named by tool:

- `.cache/turbo`
- `.cache/vitest`
- `.cache/tsbuild`
- `.cache/playwright`
- `.cache/xdg`
- `.cache/pnpm-store`

Do not add package-local cache directories for new tools. Add a named helper in
`infra/src/index.ts` and point the tool at `infra/.cache/<tool>`.
