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

export const note = (message: string, type?: NoteType | null): boolean => {
	const prefix = notePrefix(type);

	promptEnvironment().output.write(`${prefix} ${message}\n`);

	return true;
};

export const error = (message: string): boolean => note(message, 'error');

export const warning = (message: string): boolean => note(message, 'warning');

export const alert = (message: string): boolean => note(message, 'alert');

export const info = (message: string): boolean => note(message, 'info');

export const intro = (message: string): boolean => note(message, 'intro');

export const outro = (message: string): boolean => note(message, 'outro');
