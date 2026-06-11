import type { MaybePromise, TextPromptOptions } from '#tui/types';

export type SuggestOptions = TextPromptOptions & {
	options: string[] | ((query: string) => MaybePromise<string[]>);
	scroll?: number;
	info?: string | ((value: string | null) => string | null | undefined);
};

export const suggestOptions = (
	message: string | SuggestOptions,
	options: string[] | ((query: string) => MaybePromise<string[]>) = [],
	placeholder = '',
	defaultValue = '',
	scroll = 5,
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	transform: TextPromptOptions['transform'] = undefined,
): SuggestOptions => {
	if (typeof message === 'string') {
		return { message, label: message, options, placeholder, default: defaultValue, scroll, required, validate, hint, transform };
	}

	return { ...message, default: message.default ?? '' };
};
