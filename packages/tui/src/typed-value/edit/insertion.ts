import { characters, isPrintable } from '#tui/typed-value/characters';

export const insertPrintableKey = (value: string[], cursor: number, key: string): number | undefined => {
	if (!isPrintable(key)) {
		return undefined;
	}

	let nextCursor = cursor;

	for (const character of characters(key)) {
		value.splice(nextCursor, 0, character);
		nextCursor += 1;
	}

	return nextCursor;
};
