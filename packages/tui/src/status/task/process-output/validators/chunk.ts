import { z } from 'zod';

const processOutputChunkLinesSchema = z.string().transform((chunk) => chunk.split(/\r?\n/u));

export const parseProcessOutputChunkLines = (chunk: unknown): string[] => {
	return processOutputChunkLinesSchema.parse(chunk);
};
