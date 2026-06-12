import DefaultTheme from 'vitepress/theme';
import TerminalOutput from './components/TerminalOutput.vue';
import '@xterm/xterm/css/xterm.css';
import './styles.css';
import type { Theme } from 'vitepress';

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component('TerminalOutput', TerminalOutput);
	},
} satisfies Theme;
