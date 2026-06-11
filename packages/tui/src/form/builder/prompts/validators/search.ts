import { z } from 'zod';

const searchLabelSchema = z.string();

export const isSearchPromptLabel = (value: unknown): value is string => {
	return searchLabelSchema.safeParse(value).success;
};
