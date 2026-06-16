import { z } from 'zod';
import type { ChoiceOptions, MaybePromise } from '#tui/types';

export type SearchChoiceSourceCallback<T> = (query: string) => MaybePromise<ChoiceOptions<T>>;

const searchLabelSchema = z.string();
const searchChoiceOptionsSchema = <T>(): z.ZodType<ChoiceOptions<T>> => z.union([z.array(z.unknown()), z.record(z.string(), z.string())]) as z.ZodType<ChoiceOptions<T>>;
const searchChoiceSourceCallbackSchema = <T>(): z.ZodType<SearchChoiceSourceCallback<T>> => z.function() as z.ZodType<SearchChoiceSourceCallback<T>>;
const searchChoiceSourceSchema = <T>(): z.ZodType<ChoiceOptions<T> | SearchChoiceSourceCallback<T>> =>
	z.union([searchChoiceOptionsSchema<T>(), searchChoiceSourceCallbackSchema<T>()]);

export const isSearchPromptLabel = (value: unknown): value is string => {
	return searchLabelSchema.safeParse(value).success;
};

export const isSearchPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isSearchPromptLabel(value);
};

export const parseSearchStepName = (value: unknown): string | undefined => {
	const parsed = searchLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSearchChoiceSource = <T>(value: unknown): ChoiceOptions<T> | SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceSchema<T>().parse(value);
};
