import stringWidth from 'string-width';
import stripAnsi from 'strip-ansi';

export type AnsiSegment = {
	codes: string;
	text: string;
};

const ESC = '\u001B';
const ANSI_SEQUENCE = new RegExp(`^${ESC}\\[[0-9;]*m$`, 'u');
const ANSI_RESET_CODES = new Set(['0', '22', '23', '24', '27', '29', '39', '49']);

export const visibleWidth = (value: string): number => stringWidth(stripAnsi(value));

export const truncate = (value: string, width: number, marker = '...'): string => {
	if (width <= 0) {
		return '';
	}

	if (visibleWidth(value) <= width) {
		return value;
	}

	if (width <= marker.length) {
		return marker.slice(0, width);
	}

	let result = '';

	for (const char of value) {
		if (visibleWidth(`${result}${char}${marker}`) > width) {
			return `${result}${marker}`;
		}

		result += char;
	}

	return result;
};

export const parseAnsiSegments = (value: string): AnsiSegment[] => {
	const segments: AnsiSegment[] = [];

	let currentCodes = '';
	let currentText = '';
	let index = 0;

	while (index < value.length) {
		if (value[index] === '\u001B' && value[index + 1] === '[') {
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

const codedCharacters = (value: string): AnsiSegment[] => parseAnsiSegments(value).flatMap((segment) => [...segment.text].map((text) => ({ text, codes: segment.codes })));

const plainWrap = (value: string, width: number): string[] => {
	if (width <= 0) {
		return [value];
	}

	const lines: string[] = [];

	for (const originalLine of value.split('\n')) {
		let line = '';

		for (const word of originalLine.split(/(\s+)/u)) {
			if (visibleWidth(`${line}${word}`) <= width) {
				line += word;
				continue;
			}

			if (line.length > 0) {
				lines.push(line.trimEnd());
				line = '';
			}

			if (visibleWidth(word) > width) {
				let chunk = '';

				for (const char of word) {
					if (visibleWidth(`${chunk}${char}`) > width) {
						if (chunk.length > 0) {
							lines.push(chunk);
						}

						chunk = '';
					}

					chunk += char;
				}

				line = chunk;
				continue;
			}

			line = word.trimStart();
		}

		lines.push(line.trimEnd());
	}

	return lines;
};

const ansiCloseSequence = (codes: string): string => {
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

export const wrap = (value: string, width: number): string[] => {
	const plainLines = plainWrap(stripAnsi(value), width);
	const characters = codedCharacters(value);
	const result: string[] = [];

	let characterIndex = 0;

	for (const plainLine of plainLines) {
		let line = '';
		let activeCodes = '';

		for (const plainCharacter of [...plainLine]) {
			while (characterIndex < characters.length && characters[characterIndex]?.text !== plainCharacter) {
				if (characters[characterIndex]?.text === ' ') {
					characterIndex += 1;
					continue;
				}

				break;
			}

			const character = characters[characterIndex];

			if (character === undefined) {
				line += plainCharacter;
				continue;
			}

			if (character.codes !== activeCodes) {
				if (activeCodes !== '') {
					line += '\u001B[0m';
				}

				if (character.codes !== '') {
					line += character.codes;
				}

				activeCodes = character.codes;
			}

			line += plainCharacter;
			characterIndex += 1;
		}

		if (activeCodes !== '') {
			line += ansiCloseSequence(activeCodes);
		}

		result.push(line);
	}

	return result;
};

export const parseAnsiText = (value: string): string => stripAnsi(value);
