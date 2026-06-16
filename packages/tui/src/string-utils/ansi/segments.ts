import { ansiCode, ESC, isAnsiResetCode, isAnsiStyleSequence } from '#tui/string-utils/ansi/codes';

export type AnsiSegment = {
	codes: string;
	text: string;
};

export const parseAnsiSegments = (value: string): AnsiSegment[] => {
	const segments: AnsiSegment[] = [];

	let currentCodes: string[] = [];
	let currentText = '';
	let index = 0;

	while (index < value.length) {
		if (value[index] === ESC && value[index + 1] === '[') {
			if (currentText !== '') {
				segments.push({ text: currentText, codes: activeAnsiCodes(currentCodes) });
				currentText = '';
			}

			const sequence = readAnsiSequence(value, index);

			index += sequence.length;

			if (isAnsiStyleSequence(sequence)) {
				const code = ansiCode(sequence);

				currentCodes = isAnsiResetCode(code) ? resetAnsiCodes(currentCodes, code) : [...currentCodes, sequence];
			}

			continue;
		}

		currentText += value[index];
		index += 1;
	}

	if (currentText !== '') {
		segments.push({ text: currentText, codes: activeAnsiCodes(currentCodes) });
	}

	return segments;
};

const activeAnsiCodes = (codes: string[]): string => codes.join('');

const resetAnsiCodes = (codes: string[], resetCode: string): string[] => {
	if (resetCode === '0') {
		return [];
	}

	return codes.filter((sequence) => !ansiCodeMatchesReset(ansiCode(sequence), resetCode));
};

const ansiCodeMatchesReset = (code: string, resetCode: string): boolean => {
	if (resetCode === '22') {
		return code === '1' || code === '2';
	}

	if (resetCode === '23') {
		return code === '3';
	}

	if (resetCode === '24') {
		return code === '4';
	}

	if (resetCode === '27') {
		return code === '7';
	}

	if (resetCode === '29') {
		return code === '9';
	}

	if (resetCode === '39') {
		return foregroundAnsiCode(code);
	}

	if (resetCode === '49') {
		return backgroundAnsiCode(code);
	}

	return false;
};

const foregroundAnsiCode = (code: string): boolean => {
	const value = Number(code);

	return code.startsWith('38;') || (value >= 30 && value <= 37) || (value >= 90 && value <= 97);
};

const backgroundAnsiCode = (code: string): boolean => {
	const value = Number(code);

	return code.startsWith('48;') || (value >= 40 && value <= 47) || (value >= 100 && value <= 107);
};

const readAnsiSequence = (value: string, start: number): string => {
	let sequence = '';
	let index = start;

	while (index < value.length) {
		sequence += value[index];
		index += 1;

		if (isAnsiStyleSequence(sequence)) {
			break;
		}
	}

	return sequence;
};
