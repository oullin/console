import { z } from 'zod';
import type { ChoiceOptions } from '#tui/types';

const selectPromptLabelSchema = z.string();
const selectPromptChoicesSchema = z.union([z.array(z.unknown()), z.record(z.string(), z.string())]);
const selectPromptChoicesTypedSchema = <T>(): z.ZodType<ChoiceOptions<T>> => selectPromptChoicesSchema as z.ZodType<ChoiceOptions<T>>;
const confirmDefaultSchema = z.boolean();

export const isSelectPromptLabel = (value: unknown): value is string => {
	return selectPromptLabelSchema.safeParse(value).success;
};

export const hasSelectDefaultArgument = <T>(argumentCount: number, defaultValue: T | undefined): boolean => {
	return argumentCount >= 3 && defaultValue !== undefined;
};

export const hasConfirmDefaultArgument = (argumentCount: number, defaultValue: boolean | undefined): boolean => {
	return argumentCount >= 2 && defaultValue !== undefined;
};

export const parseSelectChoiceOptions = <T>(value: unknown): ChoiceOptions<T> => {
	return selectPromptChoicesTypedSchema<T>().parse(value);
};

export const parseConfirmDefault = (value: unknown, fallback: boolean): boolean => {
	const parsed = confirmDefaultSchema.safeParse(value);

	return parsed.success ? parsed.data : fallback;
};
