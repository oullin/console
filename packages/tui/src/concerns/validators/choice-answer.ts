import { z } from 'zod';

const choiceAnswerIndexSchema = z
	.string()
	.trim()
	.regex(/^\d+$/u)
	.transform((value) => Number.parseInt(value, 10));

const choiceAnswerListSchema = z.string().transform((value) =>
	value
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part.length > 0),
);

const choiceRecordKeySchema = z
	.string()
	.regex(/^-?\d+$/u)
	.transform((value) => Number.parseInt(value, 10));

const choiceRecordValueSchema = <T>(): z.ZodType<T> => z.unknown() as z.ZodType<T>;

export const parseChoiceAnswerIndex = (answer: string): number | null => {
	const parsed = choiceAnswerIndexSchema.safeParse(answer);

	return parsed.success ? parsed.data : null;
};

export const parseChoiceAnswerList = (answer: unknown): string[] => {
	return choiceAnswerListSchema.parse(answer);
};

export const parseChoiceRecordKey = (key: string): string | number => {
	const parsed = choiceRecordKeySchema.safeParse(key);

	return parsed.success ? parsed.data : key;
};

export const parseChoiceRecordValue = <T>(key: string): T => {
	return choiceRecordValueSchema<T>().parse(parseChoiceRecordKey(key));
};
