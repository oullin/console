import { z } from 'zod';

const promptOutputContentSchema = z.string();

export const parsePromptOutputContent = (content: unknown): string => {
	return promptOutputContentSchema.parse(content);
};
