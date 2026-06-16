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
	return statusSignalTargetSchema.parse(target);
};
