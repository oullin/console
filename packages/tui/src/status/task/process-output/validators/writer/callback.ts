import { z } from 'zod';

export type ProcessOutputCallback = (error?: Error | null) => void;

const processOutputEncodingSchema = z.string() as z.ZodType<BufferEncoding>;
const processOutputCallbackSchema = z.function() as z.ZodType<ProcessOutputCallback>;

export const parseProcessOutputEncoding = (value: unknown): BufferEncoding | undefined => {
	const parsed = processOutputEncodingSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseProcessOutputCallback = (encodingOrCallback: unknown, callback?: ProcessOutputCallback): ProcessOutputCallback | undefined => {
	const parsedEncodingCallback = processOutputCallbackSchema.safeParse(encodingOrCallback);

	if (parsedEncodingCallback.success) {
		return parsedEncodingCallback.data;
	}

	const parsedCallback = processOutputCallbackSchema.safeParse(callback);

	return parsedCallback.success ? parsedCallback.data : undefined;
};
