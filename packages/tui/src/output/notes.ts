import { promptEnvironment } from '#tui/environment';
import { visibleWidth } from '#tui/strings';
import { backgroundCyan, backgroundRed, black, green, red, white, yellow } from '#tui/theme/styles';

export type NoteType = 'alert' | 'error' | 'info' | 'intro' | 'outro' | 'warning' | string;

const paddedIntroLines = (lines: string[]): string[] => {
	const padded = lines.map((line) => ` ${line} `);
	const longest = Math.max(...padded.map(visibleWidth));

	return padded.map((line) => `${line}${' '.repeat(Math.max(0, longest - visibleWidth(line)))}`);
};

const renderNoteLine = (line: string, type?: NoteType | null): string => {
	switch (type) {
		case 'intro':

		case 'outro':
			return ` ${backgroundCyan(black(line))}`;

		case 'warning':
			return yellow(` ${line}`);

		case 'error':
			return red(` ${line}`);

		case 'alert':
			return ` ${backgroundRed(white(` ${line} `))}`;

		case 'info':
			return green(` ${line}`);

		default:
			return ` ${line}`;
	}
};

const renderNoteLines = (message: string, type?: NoteType | null): string[] => {
	const lines = message.split('\n');

	switch (type) {
		case 'intro':

		case 'outro':
			return paddedIntroLines(lines).map((line) => renderNoteLine(line, type));

		default:
			return lines.map((line) => renderNoteLine(line, type));
	}
};

export const note = (message: string, type?: NoteType | null): void => {
	promptEnvironment().output.write(`${renderNoteLines(message, type).join('\n')}\n`);
};

export const error = (message: string): void => note(message, 'error');

export const warning = (message: string): void => note(message, 'warning');

export const alert = (message: string): void => note(message, 'alert');

export const info = (message: string): void => note(message, 'info');

export const intro = (message: string): void => note(message, 'intro');

export const outro = (message: string): void => note(message, 'outro');
