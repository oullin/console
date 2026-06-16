import { z } from 'zod';

const multiSearchDefaultSchema = <T>(): z.ZodType<T[]> => z.array(z.unknown()) as z.ZodType<T[]>;

export const parseMultiSearchDefault = <T>(value: unknown): T[] => {
	return multiSearchDefaultSchema<T>().parse(value);
};
