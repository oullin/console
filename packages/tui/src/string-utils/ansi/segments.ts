import { ansiCode, ESC, isAnsiResetCode, isAnsiStyleSequence } from '#tui/string-utils/ansi/codes';

export type AnsiSegment = {
	codes: string;
	text: string;
};

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

			const sequence = readAnsiSequence(value, index);

			index += sequence.length;

			if (isAnsiStyleSequence(sequence)) {
				const code = ansiCode(sequence);

				currentCodes = isAnsiResetCode(code) ? '' : sequence;
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
