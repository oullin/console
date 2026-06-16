import { z } from 'zod';

const promptDefaultSchema = z.object({ default: z.unknown() }).passthrough();
const promptDefaultValueSchema = <T>(): z.ZodType<T> => z.unknown() as z.ZodType<T>;

export const hasPromptDefault = (value: unknown): boolean => {
	const parsed = promptDefaultSchema.safeParse(value);

	return parsed.success && parsed.data.default !== undefined;
};

export const parsePromptDefault = <T>(value: unknown): T => {
	return promptDefaultValueSchema<T>().parse(value);
};
