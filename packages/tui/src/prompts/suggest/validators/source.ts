import { z } from 'zod';
import type { MaybePromise } from '#tui/types';

type SuggestionSourceCallback = (query: string) => MaybePromise<string[]>;

export type ResolvedSuggestionSource = {
	filter: boolean;
	options: string[];
};

const suggestionOptionsSchema = z.array(z.string());
const suggestionSourceCallbackSchema: z.ZodType<SuggestionSourceCallback> = z.function() as z.ZodType<SuggestionSourceCallback>;
const suggestionSourceSchema = z.union([suggestionOptionsSchema, suggestionSourceCallbackSchema]);

export const isSuggestionSourceCallback = (source: string[] | SuggestionSourceCallback): source is SuggestionSourceCallback => {
	return suggestionSourceCallbackSchema.safeParse(source).success;
};

export const parseSuggestionSource = (source: unknown): string[] | SuggestionSourceCallback => {
	return suggestionSourceSchema.parse(source);
};

export const resolveSuggestionSource = async (source: string[] | SuggestionSourceCallback, query: string): Promise<ResolvedSuggestionSource> => {
	const parsed = parseSuggestionSource(source);

	if (isSuggestionSourceCallback(parsed)) {
		return { filter: false, options: suggestionOptionsSchema.parse(await parsed(query)) };
	}

	return { filter: true, options: parsed };
};
