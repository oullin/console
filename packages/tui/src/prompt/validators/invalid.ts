import { z } from 'zod';

const invalidPromptValueSchema = <T>(): z.ZodType<T | undefined> => z.unknown() as z.ZodType<T | undefined>;

export const parseInvalidPromptValue = <T>(value: unknown): T | undefined => {
	return invalidPromptValueSchema<T>().parse(value);
};
