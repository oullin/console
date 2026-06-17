import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const packagePath = dirname(fileURLToPath(import.meta.url));
const packagesPath = dirname(packagePath);
const workspacePath = dirname(packagesPath);
const docsSourcePath = join(packagePath, 'src');
const docsVitepressPath = join(packagePath, 'vitepress');
const docsThemePath = join(docsVitepressPath, 'theme');
const docsComponentsPath = join(docsThemePath, 'components');
const cachePath = join(workspacePath, 'infra', '.cache', 'vitest', 'docs');
const consoleSourcePath = join(workspacePath, 'pkgs-ts', 'console', 'src', 'index.ts');
const internalSourcePath = join(workspacePath, 'pkgs-ts', 'console', 'src', '$1');
const docsConfigPath = join(docsVitepressPath, 'config.ts');
const docsLibPath = join(docsThemePath, 'lib');
const docsTestsPath = join(packagePath, 'tests');
const docsUiPath = join(docsComponentsPath, 'ui');

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
				find: '@ollin/console',
				replacement: consoleSourcePath,
			},
			{
				find: /^#console\/(.+)$/u,
				replacement: internalSourcePath,
			},
		],
	},
	test: {
		environment: 'node',
		globals: false,
	},
});
