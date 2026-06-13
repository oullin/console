import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const provisionRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

export const provisionPath = (...segments: string[]): string => resolve(provisionRoot, ...segments);

export const toolCachePath = (...segments: string[]): string => provisionPath('.cache', ...segments);

export const turboCachePath = (...segments: string[]): string => toolCachePath('turbo', ...segments);

export const playwrightCachePath = (...segments: string[]): string => toolCachePath('playwright', ...segments);

export const tsBuildCachePath = (...segments: string[]): string => toolCachePath('tsbuild', ...segments);
