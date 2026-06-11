import { z } from 'zod';
import type { Choice } from '#tui/types';

const choiceSchema = z
	.object({
		disabled: z.union([z.boolean(), z.string()]).optional(),
		hint: z.string().optional(),
		label: z.string(),
		value: z.unknown(),
	})
	.passthrough();

const choiceRecordSchema = z.record(z.string(), z.string());

export const parseChoice = <T>(value: unknown): Choice<T> | null => {
	const parsed = choiceSchema.safeParse(value);

	return parsed.success ? (parsed.data as Choice<T>) : null;
};

export const parseChoiceRecord = (value: unknown): Record<string, string> | null => {
	const parsed = choiceRecordSchema.safeParse(value);

	return parsed.success ? parsed.data : null;
};
