import { z } from 'zod';

const previousNumberSchema = z.union([z.number(), z.string()]);
const previousArraySchema = z.array(z.unknown());
const previousBooleanSchema = z.boolean();

export const parsePreviousString = (previous: unknown, defaultValue: string): string => {
	return previous === undefined || previous === null ? defaultValue : String(previous);
};

export const parsePreviousNumber = (previous: unknown, defaultValue: number | string): number | string => {
	const parsed = previousNumberSchema.safeParse(previous);

	return parsed.success ? parsed.data : defaultValue;
};

export const parsePreviousArray = <T>(previous: unknown, defaultValue: T[]): T[] => {
	const parsed = previousArraySchema.safeParse(previous);

	return parsed.success ? (parsed.data as T[]) : defaultValue;
};

export const parsePreviousBoolean = (previous: unknown, defaultValue: boolean): boolean => {
	const parsed = previousBooleanSchema.safeParse(previous);

	return parsed.success ? parsed.data : defaultValue;
};
