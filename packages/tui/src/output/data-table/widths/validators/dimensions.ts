import { z } from 'zod';

const dataTableWidthSchema = z.number().finite().positive();

export const parseDataTableWidth = (width: unknown, defaultValue: number): number => {
	const parsed = dataTableWidthSchema.safeParse(width);

	if (!parsed.success) {
		return defaultValue;
	}

	return Math.max(1, Math.trunc(parsed.data));
};
