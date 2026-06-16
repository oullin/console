import { visibleWidth } from '#tui/string-utils/width';

const wrappedWideWord = (word: string, width: number): string[] => {
	const chunks: string[] = [];

	let chunk = '';

	for (const char of word) {
		if (visibleWidth(`${chunk}${char}`) > width) {
			if (chunk.length > 0) {
				chunks.push(chunk);
			}

			chunk = '';
		}

		chunk += char;
	}

	return [...chunks, chunk];
};

export const plainWrap = (value: string, width: number): string[] => {
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
				const chunks = wrappedWideWord(word, width);

				lines.push(...chunks.slice(0, -1));
				line = chunks.at(-1) ?? '';
				continue;
			}

			line = word.trimStart();
		}

		lines.push(line.trimEnd());
	}

	return lines;
};
