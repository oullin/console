export const previousString = (previous: unknown, defaultValue: string): string => {
	return previous === undefined || previous === null ? defaultValue : String(previous);
};

export const previousNumber = (previous: unknown, defaultValue: number | string): number | string => {
	return typeof previous === 'number' || typeof previous === 'string' ? previous : defaultValue;
};

export const previousArray = <T>(previous: unknown, defaultValue: T[]): T[] => {
	return Array.isArray(previous) ? (previous as T[]) : defaultValue;
};
