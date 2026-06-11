import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('../tui/src/index.ts', import.meta.url));
const internalSourcePath = fileURLToPath(new URL('../tui/src/$1', import.meta.url));

export default defineConfig({
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
