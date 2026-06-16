import { z } from 'zod';
import type { ChoiceOptions, MaybePromise, SearchPromptOptions } from '#tui/types';

type SearchChoiceSourceCallback<T> = (query: string) => MaybePromise<ChoiceOptions<T>>;

const searchChoiceSourceCallbackSchema = z.function();

export const isSearchChoiceSourceCallback = <T>(source: SearchPromptOptions<T>['options']): source is SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceCallbackSchema.safeParse(source).success;
};
