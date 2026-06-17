import { z } from 'zod';

const terminalTitleSchema = z
	.string()
	.transform((title) => title.replace(/[\u0000-\u001F\u007F\u009B]/gu, ''));

export const parseTerminalTitle = (title: unknown): string => {
	const parsed = terminalTitleSchema.safeParse(title);

	if (!parsed.success) {
		throw new TypeError('Terminal titles must be strings.');
	}

	return parsed.data;
};
