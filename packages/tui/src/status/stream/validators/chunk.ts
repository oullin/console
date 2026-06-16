import { z } from 'zod';

const streamChunkSchema = z.string();

export const parseStreamChunk = (chunk: unknown): string => {
	return streamChunkSchema.parse(chunk);
};
