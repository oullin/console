import { z } from 'zod';
import { choiceOptionsSchema } from '#tui/concerns/validators/choice';
import type { ChoiceOptions } from '#tui/types';

const selectPromptLabelSchema = z.string();
const selectPromptDefaultSchema = z.boolean();

export const isSelectPromptLabel = (value: unknown): value is string => {
	return selectPromptLabelSchema.safeParse(value).success;
};

export const isSelectPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isSelectPromptLabel(value);
};

export const parseSelectStepName = (value: unknown): string | undefined => {
	const parsed = selectPromptLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSelectChoiceOptions = <T>(value: unknown): ChoiceOptions<T> => {
	return choiceOptionsSchema<T>().parse(value);
};

export const parseConfirmDefault = (value: unknown, fallback: boolean): boolean => {
	const parsed = selectPromptDefaultSchema.safeParse(value);

	return parsed.success ? parsed.data : fallback;
};
