import { promptEnvironment } from '#tui/environment';

export type TerminalSize = {
	columns: number;
	rows: number;
};

export const terminalSize = (): TerminalSize => ({
	columns: process.stdout.columns ?? 80,
	rows: process.stdout.rows ?? 24,
});

export const clearTerminal = (): void => {
	promptEnvironment().output.write('\u001Bc');
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
