import { dirname, join } from 'node:path';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const packagePath = dirname(fileURLToPath(import.meta.url));
const packagesPath = dirname(packagePath);
const workspacePath = dirname(packagesPath);
const cachePath = join(workspacePath, 'infra', '.cache', 'vitest', 'tests');
const sourcePath = join(packagesPath, 'console', 'src', 'index.ts');
const internalSourcePath = join(packagesPath, 'console', 'src', '$1');

export default defineConfig({
	cacheDir: cachePath,
	resolve: {
		alias: [
			{
				find: '@ollin/console',
				replacement: sourcePath,
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
