import { z } from 'zod';

const multiSelectDefaultSchema = <T>(): z.ZodType<T[]> => z.array(z.unknown()) as z.ZodType<T[]>;

export const parseMultiSelectDefault = <T>(value: unknown): T[] => {
	return multiSelectDefaultSchema<T>().parse(value);
};
