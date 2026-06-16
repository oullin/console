import { z } from 'zod';

const scriptedInputLinesSchema = z.array(z.string());

export const parseScriptedInputLines = (lines: unknown): string[] => {
	return scriptedInputLinesSchema.parse(lines);
};
