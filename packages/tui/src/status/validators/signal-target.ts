import { z } from 'zod';

export type StatusSignalTarget = {
	off(signal: string, listener: () => void): unknown;
	on(signal: string, listener: () => void): unknown;
};

const statusSignalTargetSchema = z
	.object({
		off: z.function(),
		on: z.function(),
	})
	.passthrough() as z.ZodType<StatusSignalTarget>;

export const parseStatusSignalTarget = (target: unknown): StatusSignalTarget => {
	const parsed = statusSignalTargetSchema.safeParse(target);

	if (!parsed.success) {
		throw new TypeError('Status signal targets must include on and off functions.');
	}

	return parsed.data;
};
