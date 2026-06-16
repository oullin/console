import { z } from 'zod';

const terminalDimensionSchema = z.number().finite().positive();

export const parseTerminalDimension = (value: unknown, defaultValue: number): number => {
	const parsed = terminalDimensionSchema.safeParse(value);

	if (!parsed.success) {
		return defaultValue;
	}

	return Math.trunc(parsed.data);
};
