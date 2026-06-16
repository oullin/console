import { z } from 'zod';

const writableStreamSchema = z
	.object({
		write: z.function(),
	})
	.passthrough() as z.ZodType<NodeJS.WritableStream>;

export const parseWritableOutputStream = (stream: unknown): NodeJS.WritableStream => {
	return writableStreamSchema.parse(stream);
};
