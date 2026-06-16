import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const cachePath = fileURLToPath(new URL('../../provision/.cache/vitest/docs', import.meta.url));
const tuiSourcePath = fileURLToPath(new URL('../tui/src/index.ts', import.meta.url));
const internalSourcePath = fileURLToPath(new URL('../tui/src/$1', import.meta.url));
const docsSourcePath = fileURLToPath(new URL('src', import.meta.url));
const docsComponentsPath = fileURLToPath(new URL('src/.vitepress/theme/components', import.meta.url));
const docsConfigPath = fileURLToPath(new URL('src/.vitepress/config.ts', import.meta.url));
const docsLibPath = fileURLToPath(new URL('src/.vitepress/theme/lib', import.meta.url));
const docsTestsPath = fileURLToPath(new URL('tests', import.meta.url));
const docsThemePath = fileURLToPath(new URL('src/.vitepress/theme', import.meta.url));
const docsUiPath = fileURLToPath(new URL('src/.vitepress/theme/components/ui', import.meta.url));

export default defineConfig({
	cacheDir: cachePath,
	resolve: {
		alias: [
			{
				find: '@docs',
				replacement: docsSourcePath,
			},
			{
				find: '@docs-components',
				replacement: docsComponentsPath,
			},
			{
				find: '@docs-config',
				replacement: docsConfigPath,
			},
			{
				find: '@docs-lib',
				replacement: docsLibPath,
			},
			{
				find: '@docs-tests',
				replacement: docsTestsPath,
			},
			{
				find: '@docs-theme',
				replacement: docsThemePath,
			},
			{
				find: '@docs-ui',
				replacement: docsUiPath,
			},
			{
				find: '@ollin/tui',
				replacement: tuiSourcePath,
			},
			{
				find: /^#tui\/(.+)$/u,
				replacement: internalSourcePath,
			},
		],
	},
	test: {
		environment: 'node',
		globals: false,
	},
});
