import { z } from 'zod';

const bufferChunkSchema = z.custom<Buffer>(Buffer.isBuffer);
const rawKeyChunkTextSchema = z.union([
	z.string(),
	bufferChunkSchema.transform((chunk) => chunk.toString('utf8')),
]);

export const parseRawKeyChunkText = (chunk: unknown): string => {
	return rawKeyChunkTextSchema.parse(chunk);
};
