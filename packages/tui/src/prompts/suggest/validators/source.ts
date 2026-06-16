import { z } from 'zod';
import type { MaybePromise } from '#tui/types';

type SuggestionSourceCallback = (query: string) => MaybePromise<string[]>;

const suggestionSourceCallbackSchema = z.function();

export const isSuggestionSourceCallback = (source: string[] | SuggestionSourceCallback): source is SuggestionSourceCallback => {
	return suggestionSourceCallbackSchema.safeParse(source).success;
};
