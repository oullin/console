import { z } from 'zod';

const numberPromptLabelSchema = z.string();

export const isNumberPromptLabel = (value: unknown): value is string => {
	return numberPromptLabelSchema.safeParse(value).success;
};

export const hasNumberDefaultArgument = (hasDefaultArgument: boolean, defaultValue: number | string | undefined): boolean => {
	return hasDefaultArgument && defaultValue !== undefined;
};
