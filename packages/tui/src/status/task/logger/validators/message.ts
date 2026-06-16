import { z } from 'zod';

const taskLogMessageLinesSchema = z.string().transform((message) => message.split(/\r?\n/u).filter((line) => line.length > 0));

export const parseTaskLogMessageLines = (message: unknown): string[] => {
	return taskLogMessageLinesSchema.parse(message);
};
