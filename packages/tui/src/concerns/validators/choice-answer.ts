import { z } from 'zod';

const choiceAnswerIndexSchema = z
	.string()
	.trim()
	.regex(/^\d+$/u)
	.transform((value) => Number.parseInt(value, 10));

const choiceRecordKeySchema = z
	.string()
	.regex(/^-?\d+$/u)
	.transform((value) => Number.parseInt(value, 10));

export const parseChoiceAnswerIndex = (answer: string): number => {
	const parsed = choiceAnswerIndexSchema.safeParse(answer);

	return parsed.success ? parsed.data : Number.NaN;
};

export const parseChoiceRecordKey = (key: string): string | number => {
	const parsed = choiceRecordKeySchema.safeParse(key);

	return parsed.success ? parsed.data : key;
};
