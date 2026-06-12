import { z } from 'zod';

const selectPromptLabelSchema = z.string();

export const isSelectPromptLabel = (value: unknown): value is string => {
	return selectPromptLabelSchema.safeParse(value).success;
};
