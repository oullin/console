import { z } from 'zod';
import type { MaybePromise } from '#tui/types';

type SuggestionSourceCallback = (query: string) => MaybePromise<string[]>;

const suggestionSourceCallbackSchema: z.ZodType<SuggestionSourceCallback> = z.function() as z.ZodType<SuggestionSourceCallback>;

export const isSuggestionSourceCallback = (source: string[] | SuggestionSourceCallback): source is SuggestionSourceCallback => {
	return suggestionSourceCallbackSchema.safeParse(source).success;
};
