import { promptEnvironment } from '#tui/environment';
import { symbols } from '#tui/theme';

export type NoteType = 'alert' | 'error' | 'info' | 'intro' | 'outro' | 'warning' | string;

const notePrefix = (type?: NoteType | null): string => {
	switch (type) {
		case 'error':
			return symbols.error;

		case 'warning':

		case 'alert':
			return symbols.warning;

		case 'info':
			return symbols.info;

		case 'intro':

		case 'outro':
			return symbols.success;

		default:
			return symbols.info;
	}
};

export const note = (message: string, type?: NoteType | null): void => {
	const prefix = notePrefix(type);

	promptEnvironment().output.write(`${prefix} ${message}\n`);
};

export const error = (message: string): void => note(message, 'error');

export const warning = (message: string): void => note(message, 'warning');

export const alert = (message: string): void => note(message, 'alert');

export const info = (message: string): void => note(message, 'info');

export const intro = (message: string): void => note(message, 'intro');

export const outro = (message: string): void => note(message, 'outro');
