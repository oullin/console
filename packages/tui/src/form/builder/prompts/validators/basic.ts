import { z } from 'zod';

const basicPromptLabelSchema = z.string();

export const isBasicPromptLabel = (value: unknown): value is string => {
	return basicPromptLabelSchema.safeParse(value).success;
};
