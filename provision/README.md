# Provision Workspace

The `provision` workspace owns project tooling that is not part of the public
package runtime.

- `go` contains the local shell bridge package and builds its binary into
  `.cache/bin`.
- `ts` contains shared TypeScript helpers for provisioned paths.
- `.cache` is the only mutable tool-cache root for workspace commands.

Cache buckets are named by tool:

- `.cache/turbo`
- `.cache/vitest`
- `.cache/tsbuild`
- `.cache/playwright`
- `.cache/xdg`
- `.cache/go-build`
- `.cache/go-mod`
- `.cache/go-tmp`
- `.cache/bin`

Do not add package-local cache directories for new tools. Add a named helper in
`provision/ts/src/cache.ts` and point the tool at `provision/.cache/<tool>`.
