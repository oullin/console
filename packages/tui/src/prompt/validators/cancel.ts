import { z } from 'zod';

const cancelValueSchema = <T>(): z.ZodType<T> => z.unknown() as z.ZodType<T>;

export const parseCancelValue = <T>(value: unknown): T => {
	return cancelValueSchema<T>().parse(value);
};
