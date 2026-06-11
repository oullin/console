import { clearTerminal, setTerminalTitle } from '#tui/terminal';

export const title = (value: string): void => {
	setTerminalTitle(value);
};

export const clear = (): void => {
	clearTerminal();
};
