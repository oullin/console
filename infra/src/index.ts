import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// infra/ lives at the repo root and owns the single mutable tool-cache root.
export const infraRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export const cacheRoot = resolve(infraRoot, '.cache');

export const repoRoot = resolve(infraRoot, '..');

export const repoPath = (...segments: string[]): string => resolve(repoRoot, ...segments);

export const workspacePath = (...segments: string[]): string => repoPath('packages', ...segments);

export const cacheDir = (...segments: string[]): string => resolve(cacheRoot, ...segments);

// Named buckets, one per tool. Add new tools here and point them at
// infra/.cache/<tool> rather than introducing package-local cache directories.
export const turboCacheDir = (...segments: string[]): string => cacheDir('turbo', ...segments);

export const vitestCacheDir = (...segments: string[]): string => cacheDir('vitest', ...segments);

export const tsBuildCacheDir = (...segments: string[]): string => cacheDir('tsbuild', ...segments);

export const playwrightCacheDir = (...segments: string[]): string => cacheDir('playwright', ...segments);

export const xdgCacheDir = (...segments: string[]): string => cacheDir('xdg', ...segments);
