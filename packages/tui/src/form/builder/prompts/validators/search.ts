import { z } from 'zod';
import type { ChoiceOptions, MaybePromise } from '#tui/types';

const searchLabelSchema = z.string();
const searchChoiceSourceSchema = <T>() =>
	z.union([
		z.array(z.unknown()),
		z.record(z.string(), z.string()),
		z.function(),
	]) as z.ZodType<ChoiceOptions<T> | ((query: string) => MaybePromise<ChoiceOptions<T>>)>;

export const isSearchPromptLabel = (value: unknown): value is string => {
	return searchLabelSchema.safeParse(value).success;
};

export const parseSearchStepName = (value: unknown): string | undefined => {
	const parsed = searchLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSearchChoiceSource = <T>(value: unknown): ChoiceOptions<T> | ((query: string) => MaybePromise<ChoiceOptions<T>>) => {
	return searchChoiceSourceSchema<T>().parse(value);
};
