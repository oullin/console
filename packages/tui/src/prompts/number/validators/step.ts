import { z } from 'zod';

const numberStepSchema = z.number().finite().positive();

export const parseNumberStep = (step: unknown): number => {
	const parsed = numberStepSchema.safeParse(step);

	return parsed.success ? parsed.data : 1;
};
