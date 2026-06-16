import { z } from 'zod';

export type WritableProcessStream = {
	write: NodeJS.WriteStream['write'];
};

const processOutputWriteSchema = z.function() as z.ZodType<NodeJS.WriteStream['write']>;
const writableProcessStreamSchema = z
	.object({
		write: processOutputWriteSchema,
	})
	.passthrough() as z.ZodType<WritableProcessStream>;

export const parseProcessOutputWrite = (value: unknown): NodeJS.WriteStream['write'] => {
	const parsed = processOutputWriteSchema.safeParse(value);

	if (!parsed.success) {
		throw new TypeError('Process output writers must be functions.');
	}

	return parsed.data;
};

export const parseWritableProcessStream = (value: unknown): WritableProcessStream => {
	const parsed = writableProcessStreamSchema.safeParse(value);

	if (!parsed.success) {
		throw new TypeError('Process output streams must include a write function.');
	}

	return parsed.data;
};
