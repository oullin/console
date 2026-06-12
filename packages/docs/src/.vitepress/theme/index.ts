import DefaultTheme from 'vitepress/theme';
import TerminalOutput from '@docs-components/TerminalOutput.vue';
import '@fontsource/geist-sans/latin.css';
import '@fontsource/geist-mono/latin.css';
import '@xterm/xterm/css/xterm.css';
import '@docs-theme/styles.css';
import type { Theme } from 'vitepress';

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component('TerminalOutput', TerminalOutput);
	},
} satisfies Theme;
