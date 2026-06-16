import { z } from 'zod';
import type { Choice, ChoiceOptions } from '#tui/types';

const choiceSchema = z
	.object({
		disabled: z.union([z.boolean(), z.string()]).optional(),
		hint: z.string().optional(),
		label: z.string(),
		value: z.unknown(),
	})
	.passthrough();

const choiceRecordSchema = z.record(z.string(), z.string());
const choiceOptionsListSchema = z.array(z.unknown());
const choiceValueSchema = <T>(): z.ZodType<T> => z.unknown() as z.ZodType<T>;

export type ParsedChoiceOptions<T> =
	| {
			kind: 'list';
			options: Array<Choice<T> | T>;
	  }
	| {
			kind: 'record';
			options: Record<string, string>;
	  };

export const parseChoice = <T>(value: unknown): Choice<T> | null => {
	const parsed = choiceSchema.safeParse(value);

	return parsed.success ? (parsed.data as Choice<T>) : null;
};

export const parseChoiceRecord = (value: unknown): Record<string, string> | null => {
	const parsed = choiceRecordSchema.safeParse(value);

	return parsed.success ? parsed.data : null;
};

export const parseChoiceOptions = <T>(value: ChoiceOptions<T>): ParsedChoiceOptions<T> => {
	const record = choiceRecordSchema.safeParse(value);

	if (record.success) {
		return { kind: 'record', options: record.data };
	}

	return { kind: 'list', options: choiceOptionsListSchema.parse(value) as Array<Choice<T> | T> };
};

export const parseChoiceValue = <T>(value: unknown): T => {
	return choiceValueSchema<T>().parse(value);
};
