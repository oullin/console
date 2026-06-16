import { z } from 'zod';

const streamChunkSchema = z.string();
const streamChunkLinesSchema = streamChunkSchema.transform((chunk) => chunk.split(/\r?\n/u));

export const parseStreamChunk = (chunk: unknown): string => {
	return streamChunkSchema.parse(chunk);
};

export const parseStreamChunkLines = (chunk: unknown): string[] => {
	return streamChunkLinesSchema.parse(chunk);
};
