import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const artefactsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export const workspaceRoot = resolve(artefactsRoot, '../..');

export const provisionRoot = resolve(workspaceRoot, 'provision');

export const artefactsPath = (...segments: string[]): string => resolve(artefactsRoot, ...segments);

export const cacheDir = (...segments: string[]): string => resolve(provisionRoot, '.cache', ...segments);

export const distDir = (...segments: string[]): string => artefactsPath('dist', ...segments);

export const logDir = (...segments: string[]): string => artefactsPath('.logs', ...segments);
