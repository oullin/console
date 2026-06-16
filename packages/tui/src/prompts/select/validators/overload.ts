import { z } from 'zod';

const selectPromptLabelSchema = z.string();

export const isSelectPromptLabel = (value: unknown): value is string => {
	return selectPromptLabelSchema.safeParse(value).success;
};

export const hasSelectDefaultArgument = <T>(argumentCount: number, defaultValue: T | undefined): boolean => {
	return argumentCount >= 3 && defaultValue !== undefined;
};

export const hasConfirmDefaultArgument = (argumentCount: number, defaultValue: boolean | undefined): boolean => {
	return argumentCount >= 2 && defaultValue !== undefined;
};
