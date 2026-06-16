import { Key } from '#tui/key';
import { isKeyValueList } from '#tui/key/validators/value';

const knownRawKeys: string[] = Object.values(Key).flatMap((value) => (isKeyValueList(value) ? [...value] : [value]));

const rawKeyAliases = new Map<string, string>([
	['\r', Key.enter],
	['\u0008', Key.backspace],
]);

export const normalizeRawKey = (value: string): string => {
	return rawKeyAliases.get(value) ?? value;
};

export const isCompleteRawKey = (value: string): boolean => {
	return rawKeyAliases.has(value) || !isPartialRawKey(value);
};

export const isPartialRawKey = (value: string): boolean => {
	return knownRawKeys.some((key) => key !== value && key.startsWith(value));
};
