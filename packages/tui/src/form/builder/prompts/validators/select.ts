import { z } from 'zod';
import type { ChoiceOptions } from '#tui/types';

const selectPromptLabelSchema = z.string();
const selectPromptChoicesSchema = z.union([z.array(z.unknown()), z.record(z.string(), z.string())]);
const selectPromptChoicesTypedSchema = <T>(): z.ZodType<ChoiceOptions<T>> => selectPromptChoicesSchema as z.ZodType<ChoiceOptions<T>>;
const selectPromptDefaultSchema = z.boolean();

export const isSelectPromptLabel = (value: unknown): value is string => {
	return selectPromptLabelSchema.safeParse(value).success;
};

export const parseSelectStepName = (value: unknown): string | undefined => {
	const parsed = selectPromptLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSelectChoiceOptions = <T>(value: unknown): ChoiceOptions<T> => {
	return selectPromptChoicesTypedSchema<T>().parse(value);
};

export const parseConfirmDefault = (value: unknown, fallback: boolean): boolean => {
	const parsed = selectPromptDefaultSchema.safeParse(value);

	return parsed.success ? parsed.data : fallback;
};
