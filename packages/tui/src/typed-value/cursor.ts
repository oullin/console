import { characters, fromCharacters } from '#tui/typed-value/characters';
import { dim, inverse } from '#tui/theme/styles';

export const valueWithCursor = (value: string, cursor: number): string => {
	const chars = characters(value);
	const position = Math.max(0, Math.min(cursor, chars.length));
	const before = fromCharacters(chars.slice(0, position));
	const current = chars[position];

	if (current === '\n') {
		return `${before}${inverse(' ')}${fromCharacters(chars.slice(position))}`;
	}

	const after = fromCharacters(chars.slice(position + 1));

	return `${before}${inverse(current ?? ' ')}${after}`;
};

export const placeholderWithCursor = (placeholder = ''): string => {
	return dim(valueWithCursor(placeholder, 0));
};
