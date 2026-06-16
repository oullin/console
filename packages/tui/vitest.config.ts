import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const cachePath = fileURLToPath(new URL('../../provision/.cache/vitest/tui', import.meta.url));
const sourcePath = fileURLToPath(new URL('./src/$1', import.meta.url));

export default defineConfig({
	cacheDir: cachePath,
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
