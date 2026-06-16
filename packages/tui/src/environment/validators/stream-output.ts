import { z } from 'zod';

const writableStreamSchema = z
	.object({
		write: z.function(),
	})
	.passthrough() as z.ZodType<NodeJS.WritableStream>;

export const parseWritableOutputStream = (stream: unknown): NodeJS.WritableStream => {
	const parsed = writableStreamSchema.safeParse(stream);

	if (!parsed.success) {
		throw new Error('Prompt output streams must include a write function.');
	}

	return parsed.data;
};
