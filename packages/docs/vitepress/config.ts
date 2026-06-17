import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitepress';

const sourcePath = fileURLToPath(new URL('../src/', import.meta.url));
const themePath = fileURLToPath(new URL('theme', import.meta.url));
const themeComponentsPath = fileURLToPath(new URL('theme/components', import.meta.url));
const themeLibPath = fileURLToPath(new URL('theme/lib', import.meta.url));
const themeUiPath = fileURLToPath(new URL('theme/components/ui', import.meta.url));
const viteCachePath = fileURLToPath(new URL('../../../infra/.cache/vitepress/docs', import.meta.url));
const tailwindPlugin = tailwindcss() as never;

export const guideSections = [
	{ text: 'Introduction', link: '/guide/introduction' },
	{ text: 'Installation', link: '/guide/installation' },
	{ text: 'Available Prompts', link: '/guide/available-prompts' },
	{ text: 'Text', link: '/guide/text' },
	{ text: 'Textarea', link: '/guide/textarea' },
	{ text: 'Number', link: '/guide/number' },
	{ text: 'Password', link: '/guide/password' },
	{ text: 'Confirm', link: '/guide/confirm' },
	{ text: 'Select', link: '/guide/select' },
	{ text: 'Multi-select', link: '/guide/multiselect' },
	{ text: 'Suggest', link: '/guide/suggest' },
	{ text: 'Search', link: '/guide/search' },
	{ text: 'Multi-search', link: '/guide/multisearch' },
	{ text: 'Pause', link: '/guide/pause' },
	{ text: 'Autocomplete', link: '/guide/autocomplete' },
	{ text: 'Transforming Input Before Validation', link: '/guide/transforms' },
	{ text: 'Forms', link: '/guide/forms' },
	{ text: 'Informational Messages', link: '/guide/informational-messages' },
	{ text: 'Tables', link: '/guide/tables' },
	{ text: 'Spin', link: '/guide/spin' },
	{ text: 'Progress Bar', link: '/guide/progress' },
	{ text: 'Task', link: '/guide/task' },
	{ text: 'Stream', link: '/guide/stream' },
	{ text: 'Terminal Title', link: '/guide/terminal-title' },
	{ text: 'Clearing the Terminal', link: '/guide/clearing-terminal' },
	{ text: 'Terminal Considerations', link: '/guide/terminal-considerations' },
	{ text: 'Custom Environments', link: '/guide/fallbacks' },
	{ text: 'Testing', link: '/guide/testing' },
] as const;

export default defineConfig({
	title: '@ollin/tui',
	description: 'Documentation for the Ollin TUI prompt toolkit.',
	cleanUrls: true,
	lastUpdated: true,
	vite: {
		cacheDir: viteCachePath,
		plugins: [tailwindPlugin],
		resolve: {
			alias: [
				{ find: '@docs', replacement: sourcePath },
				{ find: '@docs-components', replacement: themeComponentsPath },
				{ find: '@docs-lib', replacement: themeLibPath },
				{ find: '@docs-theme', replacement: themePath },
				{ find: '@docs-ui', replacement: themeUiPath },
			],
		},
	},
	themeConfig: {
		nav: [
			{ text: 'Guide', link: '/guide/introduction' },
			{ text: 'API', link: '/api/' },
		],
		search: {
			provider: 'local',
		},
		sidebar: [
			{
				text: 'Guide',
				items: [...guideSections],
			},
			{
				text: 'Reference',
				items: [{ text: 'API Reference', link: '/api/' }],
			},
		],
		footer: {
			message: 'Documentation for the @ollin/tui TypeScript package.',
		},
	},
});
