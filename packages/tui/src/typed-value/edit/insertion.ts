import { characters, isPrintable } from '#tui/typed-value/characters';

export const insertPrintableKey = (value: string[], cursor: number, key: string): number | undefined => {
	if (!isPrintable(key)) {
		return undefined;
	}

	const inserted = characters(key);
	const tail = value.slice(cursor);

	value.length = cursor;

	for (const character of inserted) {
		value.push(character);
	}

	for (const character of tail) {
		value.push(character);
	}

	return cursor + inserted.length;
};
