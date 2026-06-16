import stripAnsi from 'strip-ansi';

export type AnsiSegment = {
	codes: string;
	text: string;
};

export const ESC = '\u001B';

const ANSI_SEQUENCE = new RegExp(`^${ESC}\\[[0-9;]*m$`, 'u');
const ANSI_RESET_CODES = new Set(['0', '22', '23', '24', '27', '29', '39', '49']);

export const parseAnsiSegments = (value: string): AnsiSegment[] => {
	const segments: AnsiSegment[] = [];

	let currentCodes = '';
	let currentText = '';
	let index = 0;

	while (index < value.length) {
		if (value[index] === ESC && value[index + 1] === '[') {
			if (currentText !== '') {
				segments.push({ text: currentText, codes: currentCodes });
				currentText = '';
			}

			let sequence = '';

			while (index < value.length) {
				sequence += value[index];
				index += 1;

				if (ANSI_SEQUENCE.test(sequence)) {
					const code = sequence.slice(2, -1);

					currentCodes = ANSI_RESET_CODES.has(code) ? '' : sequence;
					break;
				}
			}

			continue;
		}

		currentText += value[index];
		index += 1;
	}

	if (currentText !== '') {
		segments.push({ text: currentText, codes: currentCodes });
	}

	return segments;
};

export const ansiCloseSequence = (codes: string): string => {
	const code = codes.slice(2, -1);

	if (code === '1' || code === '2') {
		return `${ESC}[22m`;
	}

	if (code === '3') {
		return `${ESC}[23m`;
	}

	if (code === '4') {
		return `${ESC}[24m`;
	}

	if (code === '7') {
		return `${ESC}[27m`;
	}

	if (code === '9') {
		return `${ESC}[29m`;
	}

	return `${ESC}[0m`;
};

export const parseAnsiText = (value: string): string => stripAnsi(value);
