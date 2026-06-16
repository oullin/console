import { z } from 'zod';

type ProcessOutputCallback = (error?: Error | null) => void;
export type WritableProcessStream = {
	write: NodeJS.WriteStream['write'];
};

export type ResolvedProcessOutputWrite = {
	callback?: ProcessOutputCallback;
	content: string;
};

const processOutputStringSchema = z.string();
const processOutputEncodingSchema = z.string() as z.ZodType<BufferEncoding>;
const processOutputCallbackSchema = z.function() as z.ZodType<ProcessOutputCallback>;
const processOutputWriteSchema = z.function() as z.ZodType<NodeJS.WriteStream['write']>;
const writableProcessStreamSchema = z
	.object({
		write: processOutputWriteSchema,
	})
	.passthrough() as z.ZodType<WritableProcessStream>;

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

export const parseProcessOutputChunk = (chunk: string | Uint8Array, encoding?: BufferEncoding): string => {
	const parsed = processOutputStringSchema.safeParse(chunk);

	return parsed.success ? parsed.data : Buffer.from(chunk).toString(encoding);
};

export const resolveProcessOutputWrite = (
	chunk: string | Uint8Array,
	encodingOrCallback?: BufferEncoding | ProcessOutputCallback,
	callback?: ProcessOutputCallback,
): ResolvedProcessOutputWrite => {
	const encoding = parseProcessOutputEncoding(encodingOrCallback);

	return {
		callback: parseProcessOutputCallback(encodingOrCallback, callback),
		content: parseProcessOutputChunk(chunk, encoding),
	};
};

export const parseProcessOutputWrite = (value: unknown): NodeJS.WriteStream['write'] => {
	return processOutputWriteSchema.parse(value);
};

export const parseWritableProcessStream = (value: unknown): WritableProcessStream => {
	return writableProcessStreamSchema.parse(value);
};
