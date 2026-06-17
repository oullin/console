import { dirname, join } from 'node:path';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const packagePath = dirname(fileURLToPath(import.meta.url));
const packagesPath = dirname(packagePath);
const workspacePath = dirname(packagesPath);
const cachePath = join(workspacePath, 'provision', '.cache', 'vitest', 'acceptance');
const sourcePath = join(packagesPath, 'tui', 'src', 'index.ts');
const internalSourcePath = join(packagesPath, 'tui', 'src', '$1');

export default defineConfig({
	cacheDir: cachePath,
	resolve: {
		alias: [
			{
				find: '@ollin/tui',
				replacement: sourcePath,
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
