import stripAnsi from 'strip-ansi';
import { ansiCloseSequence, parseAnsiSegments } from '#tui/string-utils/ansi';
import { visibleWidth } from '#tui/string-utils/width';
import type { AnsiSegment } from '#tui/string-utils/ansi';

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
