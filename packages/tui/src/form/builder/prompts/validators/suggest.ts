import { z } from 'zod';
import type { MaybePromise } from '#tui/types';

const suggestLabelSchema = z.string();
const suggestSourceSchema = z.union([z.array(z.string()), z.function()]) as z.ZodType<string[] | ((query: string) => MaybePromise<string[]>)>;

export const isSuggestPromptLabel = (value: unknown): value is string => {
	return suggestLabelSchema.safeParse(value).success;
};

export const parseSuggestStepName = (value: unknown): string | undefined => {
	const parsed = suggestLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSuggestSource = (value: unknown): string[] | ((query: string) => MaybePromise<string[]>) => {
	return suggestSourceSchema.parse(value);
};
