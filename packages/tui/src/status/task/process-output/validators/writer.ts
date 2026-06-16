import { z } from 'zod';

const processOutputStringSchema = z.string();
const processOutputCallbackSchema = z.function();

type ProcessOutputCallback = (error?: Error | null) => void;

export const parseProcessOutputEncoding = (value: unknown): BufferEncoding | undefined => {
	const parsed = processOutputStringSchema.safeParse(value);

	return parsed.success ? (parsed.data as BufferEncoding) : undefined;
};

export const parseProcessOutputCallback = (encodingOrCallback: unknown, callback?: ProcessOutputCallback): ProcessOutputCallback | undefined => {
	const parsedEncodingCallback = processOutputCallbackSchema.safeParse(encodingOrCallback);

	if (parsedEncodingCallback.success) {
		return parsedEncodingCallback.data as ProcessOutputCallback;
	}

	const parsedCallback = processOutputCallbackSchema.safeParse(callback);

	return parsedCallback.success ? (parsedCallback.data as ProcessOutputCallback) : undefined;
};

export const parseProcessOutputChunk = (chunk: string | Uint8Array, encoding?: BufferEncoding): string => {
	const parsed = processOutputStringSchema.safeParse(chunk);

	return parsed.success ? parsed.data : Buffer.from(chunk).toString(encoding);
};
