import { z } from 'zod';

const previousNumberSchema = z.union([z.number(), z.string()]);
const previousArraySchema = <T>(): z.ZodType<T[]> => z.array(z.unknown()) as z.ZodType<T[]>;
const previousBooleanSchema = z.boolean();
const previousValueSchema = <T>(): z.ZodType<T> =>
	z
		.unknown()
		.refine((value) => value !== undefined && value !== null) as z.ZodType<T>;

export const parsePreviousString = (previous: unknown, defaultValue: string): string => {
	return previous === undefined || previous === null ? defaultValue : String(previous);
};

export const parsePreviousNumber = (previous: unknown, defaultValue: number | string): number | string => {
	const parsed = previousNumberSchema.safeParse(previous);

	return parsed.success ? parsed.data : defaultValue;
};

export const parsePreviousArray = <T>(previous: unknown, defaultValue: T[]): T[] => {
	const parsed = previousArraySchema<T>().safeParse(previous);

	return parsed.success ? parsed.data : defaultValue;
};

export const parsePreviousBoolean = (previous: unknown, defaultValue: boolean): boolean => {
	const parsed = previousBooleanSchema.safeParse(previous);

	return parsed.success ? parsed.data : defaultValue;
};

export const parsePreviousValue = <T>(previous: unknown, defaultValue: T): T => {
	const parsed = previousValueSchema<T>().safeParse(previous);

	return parsed.success ? parsed.data : defaultValue;
};
