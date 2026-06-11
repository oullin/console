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

export const parseChoice = <T>(value: unknown): Choice<T> | null => {
	const parsed = choiceSchema.safeParse(value);

	return parsed.success ? (parsed.data as Choice<T>) : null;
};
