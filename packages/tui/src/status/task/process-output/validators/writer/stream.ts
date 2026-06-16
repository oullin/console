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
	return processOutputWriteSchema.parse(value);
};

export const parseWritableProcessStream = (value: unknown): WritableProcessStream => {
	return writableProcessStreamSchema.parse(value);
};
