import { z } from 'zod';

const progressNumberSchema = z.number().finite();

export const parseProgressTotal = (total: unknown): number => {
	const parsed = progressNumberSchema.safeParse(total);
	const value = parsed.success ? Math.trunc(parsed.data) : 0;

	if (value <= 0) {
		throw new Error('Progress bar must have at least one item.');
	}

	return value;
};

export const parseProgressStep = (step: unknown): number => {
	const parsed = progressNumberSchema.safeParse(step);

	return parsed.success ? Math.trunc(parsed.data) : 0;
};
