import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const artefactsRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export const workspaceRoot = dirname(dirname(artefactsRoot));

export const provisionRoot = resolve(workspaceRoot, 'provision');

export const artefactsPath = (...segments: string[]): string => resolve(artefactsRoot, ...segments);

export const cacheDir = (...segments: string[]): string => resolve(provisionRoot, '.cache', ...segments);

export const toolBinCacheDir = (...segments: string[]): string => cacheDir('bin', ...segments);

export const goBuildCacheDir = (...segments: string[]): string => cacheDir('go-build', ...segments);

export const goModCacheDir = (...segments: string[]): string => cacheDir('go-mod', ...segments);

export const goTmpCacheDir = (...segments: string[]): string => cacheDir('go-tmp', ...segments);

export const playwrightCacheDir = (...segments: string[]): string => cacheDir('playwright', ...segments);

export const tsBuildCacheDir = (...segments: string[]): string => cacheDir('tsbuild', ...segments);

export const turboCacheDir = (...segments: string[]): string => cacheDir('turbo', ...segments);

export const vitestCacheDir = (...segments: string[]): string => cacheDir('vitest', ...segments);

export const xdgCacheDir = (...segments: string[]): string => cacheDir('xdg', ...segments);

export const distDir = (...segments: string[]): string => artefactsPath('dist', ...segments);

export const logDir = (...segments: string[]): string => artefactsPath('.logs', ...segments);
