import { z } from 'zod';

const promptDefaultSchema = z.object({ default: z.unknown() }).passthrough();

export const hasPromptDefault = (value: unknown): boolean => {
	const parsed = promptDefaultSchema.safeParse(value);

	return parsed.success && parsed.data.default !== undefined;
};
