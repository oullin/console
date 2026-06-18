import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const packagePath = dirname(fileURLToPath(import.meta.url));
const packagesPath = dirname(packagePath);
const workspacePath = dirname(packagesPath);
const docsSourcePath = join(packagePath, 'src');
const cachePath = join(workspacePath, 'infra', '.cache', 'vitest', 'docs');
const consoleSourcePath = join(workspacePath, 'pkgs-ts', 'console', 'src', 'index.ts');
const internalSourcePath = join(workspacePath, 'pkgs-ts', 'console', 'src', '$1');
const vitepressConfigPath = join(packagesPath, 'vitepress', 'config.ts');
const docsTestsPath = join(packagePath, 'tests');

export default defineConfig({
	cacheDir: cachePath,
	resolve: {
		alias: [
			{
				find: '@docs',
				replacement: docsSourcePath,
			},
			{
				find: '@docs-tests',
				replacement: docsTestsPath,
			},
			{
				find: '@ollin/vitepress',
				replacement: vitepressConfigPath,
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
