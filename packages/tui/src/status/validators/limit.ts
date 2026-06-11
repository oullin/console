import { z } from 'zod';

const limitSchema = z.number().finite();

export const parseLogLimit = (limit: unknown, defaultValue: number): number => {
	const parsed = limitSchema.safeParse(limit);

	if (!parsed.success) {
		return defaultValue;
	}

	return Math.max(0, Math.trunc(parsed.data));
};
