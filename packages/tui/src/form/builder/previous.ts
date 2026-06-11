export const previousString = (previous: unknown, defaultValue: string): string => {
	return previous === undefined || previous === null ? defaultValue : String(previous);
};

export const previousNumber = (previous: unknown, defaultValue: number): number => {
	return typeof previous === 'number' ? previous : defaultValue;
};

export const previousArray = <T>(previous: unknown, defaultValue: T[]): T[] => {
	return Array.isArray(previous) ? (previous as T[]) : defaultValue;
};
