import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const provisionRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export const provisionPath = (...segments: string[]): string => resolve(provisionRoot, ...segments);

export const toolCachePath = (...segments: string[]): string => provisionPath('.cache', ...segments);

export const toolBinCachePath = (...segments: string[]): string => toolCachePath('bin', ...segments);

export const goBuildCachePath = (...segments: string[]): string => toolCachePath('go-build', ...segments);

export const goModCachePath = (...segments: string[]): string => toolCachePath('go-mod', ...segments);

export const goTmpCachePath = (...segments: string[]): string => toolCachePath('go-tmp', ...segments);

export const playwrightCachePath = (...segments: string[]): string => toolCachePath('playwright', ...segments);

export const turboCachePath = (...segments: string[]): string => toolCachePath('turbo', ...segments);

export const vitestCachePath = (...segments: string[]): string => toolCachePath('vitest', ...segments);

export const tsBuildCachePath = (...segments: string[]): string => toolCachePath('tsbuild', ...segments);

export const xdgCachePath = (...segments: string[]): string => toolCachePath('xdg', ...segments);
