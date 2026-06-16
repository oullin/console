import { z } from 'zod';
import type { MaybePromise } from '#tui/types';

export type SuggestSourceCallback = (query: string) => MaybePromise<string[]>;

const suggestLabelSchema = z.string();
const suggestSourceCallbackSchema: z.ZodType<SuggestSourceCallback> = z.function() as z.ZodType<SuggestSourceCallback>;
const suggestSourceSchema = z.union([z.array(z.string()), suggestSourceCallbackSchema]);

export const isSuggestPromptLabel = (value: unknown): value is string => {
	return suggestLabelSchema.safeParse(value).success;
};

export const isSuggestPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isSuggestPromptLabel(value);
};

export const parseSuggestStepName = (value: unknown): string | undefined => {
	const parsed = suggestLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSuggestSource = (value: unknown): string[] | SuggestSourceCallback => {
	return suggestSourceSchema.parse(value);
};
