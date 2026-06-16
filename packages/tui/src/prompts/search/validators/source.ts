import { z } from 'zod';
import type { ChoiceOptions, MaybePromise, SearchPromptOptions } from '#tui/types';

type SearchChoiceSourceCallback<T> = (query: string) => MaybePromise<ChoiceOptions<T>>;

const searchChoiceSourceCallbackSchema = z.function();
const searchChoiceSourceSchema = <T>(): z.ZodType<ChoiceOptions<T> | SearchChoiceSourceCallback<T>> =>
	z.union([
		z.array(z.unknown()),
		z.record(z.string(), z.string()),
		searchChoiceSourceCallbackSchema,
	]) as z.ZodType<ChoiceOptions<T> | SearchChoiceSourceCallback<T>>;

export const isSearchChoiceSourceCallback = <T>(source: SearchPromptOptions<T>['options']): source is SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceCallbackSchema.safeParse(source).success;
};

export const parseSearchChoiceSource = <T>(source: unknown): ChoiceOptions<T> | SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceSchema<T>().parse(source);
};
