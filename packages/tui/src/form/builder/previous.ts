import { parsePreviousArray, parsePreviousNumber, parsePreviousString } from '#tui/form/builder/validators/previous';

export const previousString = (previous: unknown, defaultValue: string): string => {
	return parsePreviousString(previous, defaultValue);
};

export const previousNumber = (previous: unknown, defaultValue: number | string): number | string => {
	return parsePreviousNumber(previous, defaultValue);
};

export const previousArray = <T>(previous: unknown, defaultValue: T[]): T[] => {
	return parsePreviousArray(previous, defaultValue);
};
