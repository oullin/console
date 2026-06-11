import { Key } from '#tui/key';

const rawKeyAliases = new Map<string, string>([
	['\r', Key.enter],
	['\u0008', Key.backspace],
]);

export const normalizeRawKey = (value: string): string => {
	return rawKeyAliases.get(value) ?? value;
};
