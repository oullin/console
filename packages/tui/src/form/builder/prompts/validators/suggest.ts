import { z } from 'zod';

const suggestLabelSchema = z.string();

export const isSuggestPromptLabel = (value: unknown): value is string => {
	return suggestLabelSchema.safeParse(value).success;
};
