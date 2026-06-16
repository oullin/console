import { z } from 'zod';

const streamFadeStepsSchema = z.number().finite().positive();

export const parseStreamFadeSteps = (steps: unknown, defaultValue: number): number => {
	const parsed = streamFadeStepsSchema.safeParse(steps);

	if (!parsed.success) {
		return defaultValue;
	}

	return Math.max(1, Math.floor(parsed.data));
};
