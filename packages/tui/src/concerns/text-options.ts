import type { TextPromptOptions } from '#tui/types';

export const textOptions = (message: string | TextPromptOptions, fallback = ''): TextPromptOptions => {
	if (typeof message === 'string') {
		return { message, default: fallback };
	}

	return { ...message, default: message.default ?? fallback };
};
