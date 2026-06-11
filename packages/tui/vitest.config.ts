import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('./src/$1', import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^#tui\/(.+)$/u,
				replacement: sourcePath,
			},
		],
	},
	test: {
		environment: 'node',
		globals: false,
	},
});
