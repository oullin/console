import { z } from 'zod';
import type { ChoiceOptions, MaybePromise, SearchPromptOptions } from '#tui/types';

type SearchChoiceSourceCallback<T> = (query: string) => MaybePromise<ChoiceOptions<T>>;

const searchChoiceOptionsSchema = <T>(): z.ZodType<ChoiceOptions<T>> => z.union([z.array(z.unknown()), z.record(z.string(), z.string())]) as z.ZodType<ChoiceOptions<T>>;
const searchChoiceSourceCallbackSchema = <T>(): z.ZodType<SearchChoiceSourceCallback<T>> => z.function() as z.ZodType<SearchChoiceSourceCallback<T>>;
const searchChoiceSourceSchema = <T>(): z.ZodType<ChoiceOptions<T> | SearchChoiceSourceCallback<T>> =>
	z.union([searchChoiceOptionsSchema<T>(), searchChoiceSourceCallbackSchema<T>()]);

export const isSearchChoiceSourceCallback = <T>(source: SearchPromptOptions<T>['options']): source is SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceCallbackSchema<T>().safeParse(source).success;
};

export const parseSearchChoiceSource = <T>(source: unknown): ChoiceOptions<T> | SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceSchema<T>().parse(source);
};

export const resolveSearchChoiceSourceOptions = async <T>(source: SearchPromptOptions<T>['options'], query: string): Promise<ChoiceOptions<T>> => {
	const parsed = parseSearchChoiceSource<T>(source);

	return isSearchChoiceSourceCallback(parsed) ? parsed(query) : parsed;
};
