import { z } from 'zod';

const noteMessageLinesSchema = z.string().transform((message) => message.split('\n'));

export const parseNoteMessageLines = (message: unknown): string[] => {
	return noteMessageLinesSchema.parse(message);
};
