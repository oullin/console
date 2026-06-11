import { promptEnvironment } from '#tui/environment';
import { defaultBackgroundColor, defaultForegroundColor, parseTerminalColor, terminalSupportsTrueColor } from '#tui/terminal/capabilities';
import type { TerminalColor } from '#tui/terminal/capabilities';

export type TerminalSize = {
	columns: number;
	rows: number;
};

export const terminalSize = (): TerminalSize => ({
	columns: process.stdout.columns ?? 80,
	rows: process.stdout.rows ?? 24,
});

export const clearTerminal = (): void => {
	promptEnvironment().output.write('\u001B[H\u001B[J');
};

export const setTerminalTitle = (title: string): void => {
	promptEnvironment().output.write(`\u001B]0;${title}\u0007`);
};

export const eraseLine = (): void => {
	promptEnvironment().output.write('\u001B[2K');
};

export const cursorToStart = (): void => {
	promptEnvironment().output.write('\r');
};

export const supportsTrueColor = (value?: string): boolean => {
	return terminalSupportsTrueColor(value);
};

export const foregroundColor = (value?: unknown): TerminalColor => {
	return parseTerminalColor(value, defaultForegroundColor());
};

export const backgroundColor = (value?: unknown): TerminalColor => {
	return parseTerminalColor(value, defaultBackgroundColor());
};
