import { clearTerminal, setTerminalTitle } from '#tui/terminal';

export const title = (value: string): boolean => {
	setTerminalTitle(value);

	return true;
};

export const clear = (): boolean => {
	clearTerminal();

	return true;
};
